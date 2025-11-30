import { Link } from "react-router-dom";
import {
  MessageSquare,
  Users,
  TrendingUp,
  ArrowRight,
  Heart,
  Reply,
} from "lucide-react";
import styles from "./HomePage.module.scss";

export default function HomePage() {
  return (
    <div className={styles.homePage}>
      <div className={styles.header}>
        <div className={styles.badge}>✨ Modern Comment System</div>
        <h1 className={styles.title}>Welcome to CommentHub</h1>
        <p className={styles.description}>
          A modern comment system with rich interactions, nested replies, and
          real-time updates. Join 10,000+ users sharing their thoughts with the
          community.
        </p>
      </div>
      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={`${styles.iconWrapper} ${styles.blueIcon}`}>
            <MessageSquare className={styles.icon} />
          </div>
          <h3 className={styles.featureTitle}>Rich Comments</h3>
          <p className={styles.featureDescription}>
            Post comments, edit them, and engage with others through likes and
            dislikes. Format text with markdown support.
          </p>
        </div>

        <div className={`${styles.featureCard} ${styles.greenCard}`}>
          <div className={`${styles.iconWrapper} ${styles.greenIcon}`}>
            <Users className={styles.icon} />
          </div>
          <h3 className={styles.featureTitle}>Nested Replies</h3>
          <p className={styles.featureDescription}>
            Reply to comments and create engaging threaded discussions with the
            community. Perfect for detailed conversations.
          </p>
        </div>

        <div className={`${styles.featureCard} ${styles.purpleCard}`}>
          <div className={`${styles.iconWrapper} ${styles.purpleIcon}`}>
            <TrendingUp className={styles.icon} />
          </div>
          <h3 className={styles.featureTitle}>Smart Sorting</h3>
          <p className={styles.featureDescription}>
            Sort comments by most liked, most disliked, or newest to find the
            best content. AI-powered relevance sorting available.
          </p>
        </div>
      </div>

      <div className={styles.ctaSection}>
        <Link to="/comments" className={styles.ctaButton}>
          View Comments
          <ArrowRight className={styles.buttonIcon} />
        </Link>
      </div>
    </div>
  );
}
