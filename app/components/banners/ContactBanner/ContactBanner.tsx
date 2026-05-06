"use client";

import React, { useState } from 'react';
import styles from './ContactBanner.module.scss';

export default function ContactBanner() {
  const [copied, setCopied] = useState(false);
  
  const emailAddr = "klg3377@naver.com";
  const kakaoLink = "https://open.kakao.com/o/stk8oMsi";

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(emailAddr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className={styles.contactContainer}>
      <div className={styles.content}>
        <div className={styles.textSide}>
          <h2>함께 나누고 배우는 공간이 되길 바랍니다.</h2>
          <p>
            글을 읽다 궁금하신 점이나 바로잡아야 할 내용이 보이면 편하게 말씀해 주세요.<br />
            남겨주시는 소중한 의견을 통해 저 또한 한 걸음 더 성장하겠습니다.
          </p>
        </div>
        <div className={styles.buttonSide}>
          <button onClick={handleCopyEmail} className={styles.emailBtn}>
            <div className={`${styles.copyTooltip} ${copied ? styles.visible : ''}`}>
              복사되었습니다!
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            이메일 주소 복사
          </button>
          <a href={kakaoLink} target="_blank" rel="noopener noreferrer" className={styles.kakaoBtn}>
            <svg viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
              <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.557 1.707 4.8 4.34 6.091l-.81 2.962c-.044.161.053.322.21.362.052.013.107.01.157-.01l3.488-2.31c.53.074 1.07.112 1.615.112 4.97 0 9-3.185 9-7.115S16.97 3 12 3z"/>
            </svg>
            카카오톡 문의
          </a>
        </div>
      </div>
    </section>
  );
}