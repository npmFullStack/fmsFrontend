import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const HomeSkeleton = () => {
  return (
    <div className="hero min-h-screen bg-base-100 text-base-content">
      <div className="hero-content text-center">
        <div className="max-w-md w-full space-y-4">
          <Skeleton height={48} width={`70%`} className="mx-auto" />
          <Skeleton count={3} height={16} />
          <div className="flex justify-center">
            <Skeleton height={40} width={140} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSkeleton;
