import { Button } from 'antd';
import { useState } from 'react';
import { trpc } from '../trpc/client';
import { handleError } from '../trpc/handleError';
import { apiErrorMsg, getMessageApi } from '../utils/message';

export const ResendVerificationPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      await trpc.auth.resendEmail.mutate();
    } catch (err) {
      handleError(err)
        .onStatusLayerError('auth.resendEmail', '400', () =>
          getMessageApi().warning(
            'You are not using email to register. Resend email functionality are available to those not registered with email. Something might went wrong. Please reload the page.'
          )
        )
        .onOtherCondition(apiErrorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-32 mt-32">
      <div className="mb-6 text-lg">
        A confirmation email has been sent. Please click the link in the email
        in 15 mins. If you don't receive the email or the email has been
        expired, click the following button to resend. If you believe the email
        has been verified, refresh this page.
      </div>
      <Button type="primary" loading={loading} onClick={handleSendEmail}>
        Resend Email Verification
      </Button>
    </div>
  );
};
