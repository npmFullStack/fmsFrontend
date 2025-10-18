import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CategorySkeleton = () => {
  const rows = Array(10).fill(0);

  return (
    <div className="p-4">
      <div className="overflow-x-auto border rounded-md bg-base-100 shadow-sm">
        <table className="table table-xs w-full">
          <thead>
            <tr>
              {Array(7)
                .fill(0)
                .map((_, i) => (
                  <th key={i}>
                    <Skeleton height={16} />
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((_, i) => (
              <tr key={i}>
                {Array(7)
                  .fill(0)
                  .map((_, j) => (
                    <td key={j}>
                      <Skeleton height={14} />
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategorySkeleton;
