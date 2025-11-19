import React from 'react';
import Sidebar from '../components/Sidebar';
import ProfileDetails from '../components/ProfileDetails';
import '../styles/MyProfileDeveloper.css';

const ClientCard = ({ name }) => (
  <div className="client-card">
    <div className="client-info">
      <i className="fa-regular fa-user" />
      <span>{name}</span>
    </div>
    <div className="client-actions">
      <button>View project summary</button>
      <button>Update progress</button>
      <button>Share repo link</button>
    </div>
  </div>
);

const MyProfile = () => {
  const clients = ['name1', 'name2', 'name3', 'name4'];

  return (
    <div className="developer-profile-wrapper">
      <Sidebar />
      <div className="developer-profile-main">
        <ProfileDetails className="embedded-profile" fullWidth />

        <section className="my-clients">
          <h2>My Clients</h2>
          {clients.map((client, index) => (
            <ClientCard key={client + index} name={client} />
          ))}
        </section>
      </div>
    </div>
  );
};

export default MyProfile;
