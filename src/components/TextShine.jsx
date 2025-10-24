import React from 'react';

const TextShine = ({ children }) => {
  return (
    <span className="relative inline-block">
      <span className="text-content">
        {children}
      </span>
      <span 
        className="absolute inset-0 bg-[length:250%_100%] text-transparent bg-clip-text"
        style={{
          backgroundImage: `
            linear-gradient(
              110deg,
              transparent 40%,
              rgba(107, 114, 128, 0.8) 50%,
              transparent 60%
            )
          `,
          animation: 'background-shine 2.5s linear infinite',
          pointerEvents: 'none'
        }}
      >
        {children}
      </span>
    </span>
  );
};

export default TextShine;