import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_BASE_URL = import.meta.env.VITE_API_URL;
import { ENDPOINT } from '../routers/endpoint';
const ProfileEdit = () => {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    phoneNumber: '',
    dob: '',
    gender: '',
    password: '',
    roleId: '',
    status: '',
  });

  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const id = payload.id;
    setUserId(id);

    axios
      .get(`${API_BASE_URL}${ENDPOINT.USER}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const user = res.data.data;
        setFormData({
          email: user.email || '',
          displayName: user.name || '',
          phoneNumber: user.phone || '',
          dob: user.dob || '',
          gender: user.gender || '',
          password: '',
          roleId: user.role_id?.toString() || '',
          status: user.status?.toString() || '1',
        });
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Failed to fetch user data');
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const { roleId, status, email, password, ...form } = formData;

      if (formData.password !== '') {
        (form as typeof form & { password: string }).password = formData.password;
      }
      const res = await axios.put(
        `${API_BASE_URL}${ENDPOINT.USER}/edit/${userId}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Update successful!', { position: 'top-right' });
    } catch (err) {
      toast.error('Update failed!', { position: 'top-right' });
    }
  };

  if (loading) return <p>Loading...</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <main
        className="main"
        id="main"
        style={{ padding: '2rem', fontFamily: 'Segoe UI, sans-serif' }}
      >
        <div className="pagetitle" style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Private profile</h1>
          <nav>
            <ol
              className="breadcrumb"
              style={{
                listStyle: 'none',
                display: 'flex',
                gap: '0.5rem',
                padding: 0,
              }}
            >
              <li className="breadcrumb-item">
                <a
                  href="/dashboard"
                  style={{ textDecoration: 'none' }}
                >
                  CMS
                </a>
              </li>
              <li className="breadcrumb-item active">Profile</li>
            </ol>
          </nav>
        </div>

        <div
          style={{
            maxWidth: 600,
            margin: '0 auto',
            background: '#f9f9f9',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '1.5rem',
              fontSize: '1.5rem',
            }}
          >
            Edit your profile
          </h2>

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Email', name: 'email', type: 'email', disabled: true },
              { label: 'Name', name: 'displayName', type: 'text', disabled: false, required: true },
              { label: 'Phone Number', name: 'phoneNumber', type: 'text', disabled: false, required: true },
              { label: 'Date of Birth', name: 'dob', type: 'date', disabled: false, required: false },
              {
                label: 'Gender',
                name: 'gender',
                type: 'select',
                options: [
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                ],
                required: false
              },
              {
                label: 'New Password (if you want to change)',
                name: 'password',
                type: 'password',
                required: false
              },
            ].map(({ label, name, type, required, options, disabled }) => (
              <div style={{ marginBottom: '1rem' }} key={name}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {label} 
                  {
                    required && <span style={{ color: 'red' }}> * </span>
                  }
                </label>
                {
                  (type == 'text' || type == 'date' || type == 'password' || type == 'email') && (
                    <input
                      type={type}
                      name={name}
                      disabled={disabled}
                      value={formData[name as keyof typeof formData]}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        fontSize: '1rem',
                      }}
                      required={required}
                      onChange={handleChange}
                    />
                  )
                }
                {
                  type == 'select' && (
                    <select
                      name={name}
                      value={formData[name as keyof typeof formData]}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        fontSize: '1rem',
                      }}
                      onChange={handleChange}
                    >
                      {options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )
                }
              </div>
            ))}

            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                }}
              >
                Role:
              </label>
              <select
                name="roleId"
                value={formData.roleId}
                disabled
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  fontSize: '1rem',
                  backgroundColor: '#eee',
                  color: '#555',
                }}
              >
                <option value="1">Admin</option>
                <option value="2">Teacher</option>
                <option value="3">Parent</option>
                <option value="4">Student</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                }}
              >
                Status account:
              </label>
              <select
                name="status"
                value={formData.status}
                disabled
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc', 
                  borderRadius: '5px',
                  fontSize: '1rem',
                   backgroundColor: '#eee',
                  color: '#555',
                }}
              >
                <option value="1">Active</option>
                <option value="0">Lock</option>
              </select>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Save Changes
            </button>
          </form>
        </div>
        <ToastContainer />
      </main>
    </>
  );
};

export default ProfileEdit;
