import axios from "axios";
import toast from "react-hot-toast";

export const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${baseUrl}/api/user/resend-verification`, { email });
      toast.success("Verification email resent");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to resend verification"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='bg-base-200 shadow-lg rounded-lg p-8'>
        <h2 className='text-2xl font-bold mb-4'>Resend Verification Email</h2>
        <form onSubmit={handleResend} className='flex flex-col gap-4'>
          <input
            type='email'
            placeholder='Enter your email'
            className='input input-bordered input-primary'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className='btn btn-primary' disabled={loading}>
            {loading ? (
              <span className='loading loading-spinner'></span>
            ) : (
              "Resend Verification"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
