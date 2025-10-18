import React from 'react';
import PageLayout from '../components/layout/PageLayout';

const Home = () => {
  return (
    <PageLayout 
      title="Dashboard" 
      subtitle="Welcome to X-TRA MILE FREIGHT FORWARDING INC. Management System"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add your dashboard cards here */}
        <div className="card-wrapper">
          <h3 className="card-header">Quick Stats</h3>
          <p className="text-muted">Your dashboard content goes here...</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Home;