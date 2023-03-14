import style from './Loading.module.css';
export const Loading = ({ isShow }: { isShow: boolean }) => {
    return (
        <div
            className='absolute w-full h-full bg-gray-800 z-10'
            style={{ display: isShow ? '' : 'none' }}
        >
            <div className={style.loader}>
                <div className={style.loader_square}></div>
                <div className={style.loader_square}></div>
                <div className={style.loader_square}></div>
                <div className={style.loader_square}></div>
                <div className={style.loader_square}></div>
                <div className={style.loader_square}></div>
                <div className={style.loader_square}></div>
            </div>
        </div>
    );
};
