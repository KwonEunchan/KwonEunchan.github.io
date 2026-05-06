'use client';

import React, { useState, useEffect } from 'react';
import styles from './CareerBanner.module.scss';

export default function CareerBanner() {
  const [experienceString, setExperienceString] = useState('');

  useEffect(() => {
    const startDate = new Date('2022-11-07');
    const currentDate = new Date();

    let years = currentDate.getFullYear() - startDate.getFullYear();
    let months = currentDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const yearStr = years > 0 ? `${years}년` : '';
    const monthStr = months > 0 ? ` ${months}개월` : '';

    setExperienceString(`${yearStr}${monthStr}`.trim());
  }, []);

  if (!experienceString) return null;

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.bannerContainer}>
        <div className={styles.messageSection}>
          <div className={styles.iconWrapper}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon}>
              <path d="M12 3L13.912 8.81298C14.183 9.63854 14.832 10.2875 15.6575 10.5585L21.4705 12.4705L15.6575 14.3825C14.832 14.6535 14.183 15.3025 13.912 16.128L12 21.941L10.088 16.128C9.81703 15.3025 9.16803 14.6535 8.34247 14.3825L2.52948 12.4705L8.34247 10.5585C9.16803 10.2875 9.81703 9.63854 10.088 8.81298L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.message}>
            매일 성장하는 과정을 기록하고 있습니다.
          </span>
        </div>
        
        <div className={styles.badgeSection}>
          <div className={styles.experienceBadge}>
            <span className={styles.dot} />
            <span className={styles.badgeLabel}>Experience</span>
            <span className={styles.badgeValue}>{experienceString}</span>
          </div>
        </div>
      </div>
    </div>
  );
}