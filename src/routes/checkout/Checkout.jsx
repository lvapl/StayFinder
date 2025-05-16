import React, { useEffect, useState } from 'react';
import FinalBookingSummary from './components/final-booking-summary/FinalBookingSummary';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getReadableMonthFormat } from 'utils/date-helpers';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from 'contexts/AuthContext';
import { useContext } from 'react';
import { networkAdapter } from 'services/NetworkAdapter';
import Loader from 'components/ux/loader/loader';
import Toast from 'components/ux/toast/Toast';

const Checkout = () => {
  const [errors, setErrors] = useState({});

  const location = useLocation();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [toastMessage, setToastMessage] = useState('');

  const { isAuthenticated, userDetails } = useContext(AuthContext);

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const [paymentConfirmationDetails, setPaymentConfirmationDetails] = useState({
    isLoading: false,
    data: {},
  });

  const dismissToast = () => {
    setToastMessage('');
  };

  const [formData, setFormData] = useState({
    email: userDetails?.email ? userDetails?.email : '',
    nameOnCard: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const checkInDateTime = `${getReadableMonthFormat(
    searchParams.get('checkIn')
  )}, ${location.state?.checkInTime}`;
  const checkOutDateTime = `${getReadableMonthFormat(
    searchParams.get('checkOut')
  )}, ${location.state?.checkOutTime}`;

  useEffect(() => {
    const locationState = location.state;
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    if (!locationState || !checkIn || !checkOut) {
      const hotelCode = searchParams.get('hotelCode');
      navigate(`/hotel/${hotelCode}`);
    }
  }, [location, navigate, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isValid = validationSchema[name](value);
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: !isValid });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const isFieldValid = validationSchema[field](formData[field]);
      newErrors[field] = !isFieldValid;
      isValid = isValid && isFieldValid;
    });

    setErrors(newErrors);

    if (!isValid) {
      return;
    }

    setIsSubmitDisabled(true);
    setPaymentConfirmationDetails({
      isLoading: true,
      data: {},
    });
    const response = await networkAdapter.post(
      '/api/payments/confirmation',
      formData
    );
    if (response && response.data && response.errors.length === 0) {
      setPaymentConfirmationDetails({
        isLoading: false,
        data: response.data,
      });
      const hotelName = searchParams.get('hotelName').replaceAll('-', '_');
      navigate(`/booking-confirmation?payment=sucess&hotel=${hotelName}`, {
        state: {
          confirmationData: response.data,
        },
      });
    } else {
      setToastMessage('Оплата не удалась. Повторите попытку.');
      setIsSubmitDisabled(false);
      setPaymentConfirmationDetails({
        isLoading: false,
        data: {},
      });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <FinalBookingSummary
        hotelName={searchParams.get('hotelName').replaceAll('-', ' ')}
        checkIn={checkInDateTime}
        checkOut={checkOutDateTime}
        isAuthenticated={isAuthenticated}
        phone={userDetails?.phone}
        email={userDetails?.email}
        fullName={userDetails?.fullName}
      />
      <div className="relative bg-white border shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg mx-auto">
        {paymentConfirmationDetails.isLoading && (
          <Loader
            isFullScreen={true}
            loaderText={'Оплата в процессе, подождите!'}
          />
        )}
        <form
          onSubmit={handleSubmit}
          className={` ${
            paymentConfirmationDetails.isLoading ? 'opacity-40' : ''
          }`}
        >
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required={true}
            error={errors.email}
          />
          <InputField
            label="Имя на карте"
            type="text"
            name="nameOnCard"
            value={formData.nameOnCard}
            onChange={handleChange}
            placeholder="Имя на карте"
            required={true}
            error={errors.nameOnCard}
          />
          <InputField
            label="Номер карты"
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleChange}
            placeholder="0000 0000 0000 0000"
            required={true}
            error={errors.cardNumber}
          />
          <div className="flex mb-4 justify-between">
            <InputField
              label="Дата окончания (MM/YY)"
              type="text"
              name="expiry"
              value={formData.expiry}
              onChange={handleChange}
              placeholder="MM/YY"
              required={true}
              error={errors.expiry}
            />
            <InputField
              label="CVC"
              type="text"
              name="cvc"
              value={formData.cvc}
              onChange={handleChange}
              placeholder="CVC"
              required={true}
              error={errors.cvc}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300 ${
                isSubmitDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
              }`}
              type="submit"
              disabled={isSubmitDisabled}
            >
              Оплатить {location.state?.total}
            </button>
          </div>
        </form>

        {toastMessage && (
          <div className="my-4">
            <Toast
              message={toastMessage}
              type={'error'}
              dismissError={dismissToast}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const InputField = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
}) => (
  <div className="mb-4">
    <label
      className="block text-gray-700 text-sm font-bold mb-2"
      htmlFor={name}
    >
      {label}
    </label>
    <input
      className={`shadow appearance-none border ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      aria-invalid={error ? 'true' : 'false'}
    />
    {error && (
      <p className="text-red-500 text-xs my-1">Please check this field.</p>
    )}
  </div>
);

const validationSchema = {
  email: (value) => /\S+@\S+\.\S+/.test(value),
  nameOnCard: (value) => value.trim() !== '',
  cardNumber: (value) => /^\d{16}$/.test(value),
  expiry: (value) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(value),
  cvc: (value) => /^\d{3,4}$/.test(value),
};

export default Checkout;
