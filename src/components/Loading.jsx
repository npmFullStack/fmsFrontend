import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <Skeleton height={40} width={`60%`} className="mx-auto" />
        <Skeleton count={3} height={20} />
        <div className="flex justify-center">
          <Skeleton height={36} width={120} />
        </div>
      </div>
    </div>
  );
};

export default Loading;
