import React, { useState, useEffect } from 'react';
import UserService from '../services/user.service';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await UserService.getProfile();
        setUser({
          ...userResponse.data,
          name: userResponse.data.name || '',
          monthlyIncome: userResponse.data.monthlyIncome || '',
        });
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...user,
        name: user.name === '' ? null : user.name,
        monthlyIncome: user.monthlyIncome === '' ? null : user.monthlyIncome,
      };
      const updatedUser = await UserService.updateProfile(dataToSend);
      setUser(updatedUser.data);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  if (loading) return <div className='text-center'>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 text-center">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.name || user?.username}&background=random`}
                    alt="Profile"
                    className="img-fluid rounded-circle mb-3"
                    style={{ width: '150px', height: '150px' }}
                  />
                  <h4>{user?.name || user?.username}</h4>
                  <p className="text-muted">{user?.email}</p>
                </div>
                <div className="col-md-8">
                  <h4 className="card-title mb-4">Profile Information</h4>
                  {successMessage && <div className="alert alert-success">{successMessage}</div>}
                  {!isEditing ? (
                    <div>
                      <div className="form-group mb-3">
                        <label>Name</label>
                        <p className="form-control-static">{user?.name || 'N/A'}</p>
                      </div>
                      <div className="form-group mb-3">
                        <label>Email</label>
                        <p className="form-control-static">{user?.email}</p>
                      </div>
                      <div className="form-group mb-3">
                        <label>Monthly Income</label>
                        <p className="form-control-static">{user?.monthlyIncome ? `${user.monthlyIncome}` : 'N/A'}</p>
                      </div>
                      <div className="d-flex justify-content-end mt-4">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfile}>
                      <div className="form-group mb-3">
                        <label>Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={user?.name || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group mb-3">
                        <label>Email</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={user?.email || ''}
                          disabled
                        />
                      </div>
                      <div className="form-group mb-3">
                        <label>Monthly Income</label>
                        <input
                          type="number"
                          className="form-control"
                          name="monthlyIncome"
                          value={user?.monthlyIncome || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="d-flex justify-content-end mt-4">
                        <button
                          type="submit"
                          className="btn btn-success me-2"
                        >
                          Update Profile
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

