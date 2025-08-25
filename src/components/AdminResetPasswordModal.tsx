import React, { useState } from 'react';
import { useAdminResetPassword } from '../hooks/useAdminResetPassword';

interface Props {
  userId: string;
  onClose: () => void;
}

const AdminResetPasswordModal: React.FC<Props> = ({ userId, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const { resetPassword, loading, error, success } = useAdminResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setConfirmTouched(true);
      return;
    }
    await resetPassword(userId, newPassword);
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Reset Password for User</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3 position-relative">
                <input
                  type="password"
                  className="form-control"
                  placeholder="New password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 position-relative">
                <input
                  type="password"
                  className={`form-control ${confirmTouched && newPassword !== confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    setConfirmTouched(true);
                  }}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                {confirmTouched && confirmPassword && (
                  newPassword === confirmPassword ? (
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'green' }}>
                      <i className="bi bi-check-circle-fill"></i>
                    </span>
                  ) : (
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'red' }}>
                      <i className="bi bi-x-circle-fill"></i>
                    </span>
                  )
                )}
                {confirmTouched && newPassword !== confirmPassword && (
                  <div className="invalid-feedback">Passwords do not match.</div>
                )}
              </div>
              <button type="submit" className="btn btn-primary me-2" disabled={loading}>Reset</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            </form>
            {success && <p className="text-success mt-2">Password reset successfully!</p>}
            {error && <p className="text-danger mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResetPasswordModal;
