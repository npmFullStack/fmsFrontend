import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <div className="hero min-h-screen bg-base-100 text-base-content">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
            <p className="mb-5">
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
              excepturi exercitationem quasi. In deleniti eaque aut repudiandae
              et a id nisi.
            </p>
            <Link to="/Category">
              <button className="btn bg-blue-600 text-white">Get Started</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
