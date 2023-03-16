import styles from './Loading.module.css';
export const Loading = ({ isShow }: { isShow: boolean }) => {
    return (
        <div style={{ display: isShow ? '' : 'none' }}>
            <div className={styles.loader}>
                <div className={styles.circle}></div>
                <div className={styles.circle}></div>
                <div className={styles.circle}></div>
                <div className={styles.circle}></div>
            </div>
        </div>
    );
};
