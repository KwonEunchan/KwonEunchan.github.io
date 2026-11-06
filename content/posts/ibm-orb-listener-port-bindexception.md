---
title: "IBM JDK ORB 리스너의 임의 포트 점유로 인한 BindException 분석"
description: "IBM JDK 내장 ORB가 기동 시 임의로 할당받은 리스너 포트가 다른 JVM의 서비스 포트와 겹치면서 인바운드 엔드포인트가 기동되지 못한 건"
date: "2026-11-05"
category: troubleshooting
template: troubleshooting
tags:
  - JVM
  - IBM JDK
  - ORB
  - BindException
---

## 문제 상황

패치 작업 이후 재기동 과정에서 `BindException`이 발생하며 TCP 인바운드 엔드포인트 하나가 정상적으로 기동되지 않는 현상이 발생했습니다.
편의상 엔드포인트가 기동되지 못한 JVM을 JVM#1, 해당 포트를 점유하고 있던 JVM을 JVM#2로 표현하겠습니다.

* JVM#1, JVM#2는 같은 장비에서 동작하는 연계 솔루션의 멤버 JVM이며, IBM JDK 기반으로 운영 중
* JVM#1의 TCP 인바운드 엔드포인트가 LISTEN 해야 할 포트를 JVM#2가 먼저 점유하고 있었음
* 이로 인해 해당 엔드포인트로 수신되어야 할 일부 거래 전문이 인입되지 못함

이상한 점은 JVM#2에는 해당 포트를 사용하도록 설정된 항목이 전혀 없었다는 점입니다.
도메인 설정 및 어댑터 설정 등을 모두 점검해 보았으나, 해당 포트 번호는 JVM#1의 엔드포인트 설정에서만 확인되었습니다.

## 원인 분석

### 에페메럴 포트 점유 여부 확인

처음에는 이전에 겪었던 에페메럴 포트 충돌 건과 동일한 이슈로 보였습니다.
설정에 없는 포트를 다른 JVM이 점유하고 있었고, 재기동 시점에 발생했다는 점까지 비슷했기 때문입니다.

그러나 점유 중인 포트의 상태를 확인해 보니 ESTABLISHED가 아닌 LISTEN 상태였습니다.

* 에페메럴 포트는 외부로 나가는 세션의 로컬 포트로 할당되는 것이므로, 원인이 에페메럴 포트라면 해당 포트는 ESTABLISHED 등 세션 상태여야 함
* LISTEN 상태라는 것은 JVM#2 내부의 무언가가 해당 포트로 서버 소켓을 bind 하여 접속을 기다리고 있다는 의미임
* 즉, 에페메럴 포트 충돌과는 다른 원인으로 보였으며, JVM#2에서 해당 포트로 LISTEN 중인 주체를 찾을 필요가 있었음

### 포트를 점유한 쓰레드 확인

설정 상으로는 근거를 찾을 수 없었기에, JVM#2의 쓰레드 덤프를 확보하여 해당 포트를 점유한 쓰레드를 직접 확인해 보았습니다.

> 💡 아래 쓰레드 덤프는 내부 재현 환경에서 확보한 샘플이며, 실제 운영 환경의 값과는 다릅니다.

```text
3XMTHREADINFO      "LT=0:P=728690:O=0:port=9196" J9VMThread:0x0000000000947800, ... state:R, prio=5
3XMJAVALTHREAD            (java/lang/Thread getId:0x3A, isDaemon:true)
3XMTHREADINFO3           Java callstack:
4XESTACKTRACE                at java/net/PlainSocketImpl.socketAccept(Native Method)
4XESTACKTRACE                at java/net/AbstractPlainSocketImpl.accept(AbstractPlainSocketImpl.java:576)
4XESTACKTRACE                at java/net/ServerSocket.implAccept(ServerSocket.java:560)
4XESTACKTRACE                at java/net/ServerSocket.accept(ServerSocket.java:527)
4XESTACKTRACE                at com/ibm/rmi/transport/ListenerThread.run(ListenerThread.java:172)
```

* 쓰레드명이 `LT=0:P=...:O=0:port=[포트 번호]` 형태이며, 실제 운영 환경에서는 이 포트 번호가 JVM#1의 엔드포인트 포트와 동일했음
* 콜스택 최상단이 `com.ibm.rmi.transport.ListenerThread`로, 솔루션 쪽 리스너가 아닌 IBM JDK에 내장된 ORB(CORBA)의 리스너 쓰레드임을 확인함
* 즉, 설정에 의해 열린 포트가 아니라 서버 기동 과정에서 JDK 내부적으로 생성된 리스너가 점유한 것으로 보임

솔루션이 사용하는 포트는 설정에 정의된 포트와, 내부 기능(JNDI, RMI 등)을 위해 기준 포트로부터 일정 범위 이내에서 사용하는 포트로 한정됩니다.
반면 IBM ORB 리스너는 솔루션의 포트 관리 범위 밖에서 동작하기 때문에, 설정 파일만 점검해서는 확인할 수 없었던 것입니다.

### ORB 리스너 포트의 할당 방식 확인

내부 환경에서 IBM JDK로 여러 차례 기동해 보니, ORB 리스너 포트가 기동할 때마다 다르게 할당되는 것을 확인할 수 있었습니다.

```text
// 1회차
"LT=0:P=577740:O=0:port=21749"

// 2회차
"LT=0:P=728690:O=0:port=9196"
```

* ORB 리스너 포트를 별도로 지정하지 않으면, 기동 시마다 OS로부터 임의의 포트를 할당받는 것으로 보임
* OS 입장에서는 이미 LISTEN 중인 포트만 피해서 할당하므로, 재기동 등으로 JVM#1의 엔드포인트가 아직 올라오지 않은 시점이라면 해당 포트도 할당 대상이 될 수 있음
* 이번 건은 JVM#2가 먼저 기동되면서 하필 JVM#1의 엔드포인트 포트를 할당받은 것으로 판단됨

즉, 특정 JVM의 설정 문제가 아니라 IBM JDK를 사용하는 모든 JVM에서 기동 순서와 할당 결과에 따라 간헐적으로 발생할 수 있는 유형입니다.

## 해결 방법

ORB 리스너 포트는 아래 JVM 옵션으로 고정할 수 있음을 내부 테스트를 통해 확인했습니다.

```text
-Dcom.ibm.CORBA.ListenerPort=[포트 번호]
```

```text
// JVM 옵션 적용 후 기동 ( -Dcom.ibm.CORBA.ListenerPort=12345 )
"LT=0:P=807937:O=0:port=12345"
```

* 옵션 적용 후에는 재기동 시마다 지정한 포트로 고정되어 기동되는 것을 확인함
* 같은 장비의 모든 JVM에 대해 서비스 포트 및 다른 JVM의 ORB 포트와 겹치지 않는 포트를 각각 지정할 것을 권고함
* 다만 내부 테스트에 사용한 IBM JDK와 운영 환경의 마이너 버전 간 차이가 있을 수 있으므로, 옵션 적용 전 IBM 측 가이드를 받아 진행할 것을 함께 안내함

추가로 운영 중 기동 전후로 솔루션 로그에서 `BindException` 발생 여부를 점검하는 절차도 함께 권고했습니다.
엔드포인트 하나가 기동에 실패하더라도 JVM 자체는 정상 기동된 것처럼 보이기 때문에, 로그를 따로 확인하지 않으면 거래가 누락되기 전까지 알아차리기 어렵기 때문입니다.

## 결과

포트를 점유한 주체가 설정된 리스너가 아닌 IBM JDK 내장 ORB 리스너였음을 쓰레드 덤프로 확인하였고, JVM 옵션으로 포트를 고정할 수 있음을 내부 테스트로 검증했습니다.
옵션이 모든 JVM에 적용되면 동일한 현상은 재발하지 않을 것으로 예상됩니다만, 운영 환경의 JDK 버전에서도 동일하게 동작하는지는 IBM 가이드와 함께 확인이 필요할 듯합니다.

## 배운 점

설정에 없는 포트가 점유되어 있다면 설정 파일을 반복해서 보기보다, 쓰레드 덤프에서 해당 포트로 `accept` 중인 쓰레드의 콜스택부터 확인하는 편이 훨씬 빨랐습니다.
쓰레드명과 콜스택만으로도 솔루션의 리스너인지, JDK 내부의 리스너인지를 바로 구분할 수 있었습니다.

또한 애플리케이션이 직접 정의하지 않은 포트라도 JDK나 라이브러리가 내부적으로 열어두는 리스너가 있을 수 있다는 점을 알게 되었습니다.
특히 같은 장비에 여러 JVM이 공존하는 환경이라면, 서비스 포트뿐만 아니라 이런 임의 할당 포트까지 고정해 두어야 기동 순서와 관계없이 안정적으로 운영할 수 있을 것 같습니다.
