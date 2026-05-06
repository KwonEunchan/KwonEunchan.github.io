import CareerBanner from '@/app/components/banners/CareerBanner/CareerBanner';
import RecommendedPosts from '@/app/components/post/RecommendedPosts/RecommendedPosts';
import styles from './styles/page.module.scss';
import ContactBanner from '@/app/components/banners/ContactBanner/ContactBanner';

export default function Home() {
  return (
    <main className={styles.mainContent}>
      <CareerBanner />
      <ContactBanner />
      <RecommendedPosts 
        postIds={[]} 
      />
    </main>
  );
}