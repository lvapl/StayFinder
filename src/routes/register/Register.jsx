import { useState } from 'react';
import { Link } from 'react-router-dom';
import { networkAdapter } from 'services/NetworkAdapter';
import { useNavigate } from 'react-router-dom';
import Toast from 'components/ux/toast/Toast';
import { REGISTRATION_MESSAGES } from 'utils/constants';
import { Formik, Form, Field } from 'formik';
import Schemas from 'utils/validation-schemas';

const Register = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (values) => {
    const response = await networkAdapter.put('/api/users/register', values);
    console.log('response', response);
    if (response && response.errors && response.errors.length < 1) {
      setToastMessage(REGISTRATION_MESSAGES.SUCCESS);
      setShowToast(true);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setToastType('error');
      setToastMessage(response.errors[0]);
      setShowToast(true);
    }
  };

  return (
    <>
      <div className="register__form">
        <div className="container mx-auto p-4 flex justify-center min-h-[600px] items-center">
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phoneNumber: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={Schemas.signupSchema}
            onSubmit={(values) => handleSubmit(values)}
          >
            {({ errors, touched }) => (
              <Form>
                <div className="w-full max-w-lg p-4 shadow-md md:p-10">
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-extrabold text-brand">
                      Регистрация
                    </h2>
                    <p className="text-gray-500">
                      Создайте свою учетную запись и начните свое путешествие вместе с нами
                    </p>
                  </div>
                  <div className="flex flex-wrap mb-6 -mx-3">
                    <div className="w-full px-3 mb-6 md:w-1/2 md:mb-0 relative">
                      <Field
                        name="firstName"
                        placeholder="Имя"
                        autoComplete="given-name"
                        className={`${errors.firstName && touched.firstName ? 'border-red-500' : ''} border block w-full px-4 py-3 mb leading-tight text-gray-700 bg-gray-200 rounded appearance-none focus:outline-none focus:bg-white`}
                      />
                    </div>
                    <div className="w-full px-3 md:w-1/2">
                      <Field
                        name="lastName"
                        placeholder="Фамилия"
                        autoComplete="family-name"
                        className={`${errors.lastName && touched.lastName ? 'border-red-500' : ''} border block w-full px-4 py-3 mb leading-tight text-gray-700 bg-gray-200 rounded appearance-none focus:outline-none focus:bg-white`}
                      />
                    </div>
                  </div>
                  <div className="mb-6">
                    <Field
                      name="email"
                      placeholder="Email"
                      autoComplete="email"
                      className={`${errors.email && touched.email ? 'border-red-500' : ''} border block w-full px-4 py-3 mb leading-tight text-gray-700 bg-gray-200 rounded appearance-none focus:outline-none focus:bg-white`}
                    />
                  </div>
                  <div className="mb-6">
                    <Field
                      name="phoneNumber"
                      placeholder="Телефон"
                      autoComplete="tel"
                      className={`${errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''} border block w-full px-4 py-3 mb leading-tight text-gray-700 bg-gray-200 rounded appearance-none focus:outline-none focus:bg-white`}
                    />
                  </div>
                  <div className="mb-6">
                    <Field
                      name="password"
                      placeholder="Пароль"
                      autoComplete="new-password"
                      className={`${errors.password && touched.password ? 'border-red-500' : ''} border block w-full px-4 py-3 mb leading-tight text-gray-700 bg-gray-200 rounded appearance-none focus:outline-none focus:bg-white`}
                    />
                  </div>
                  <div className="mb-6">
                    <Field
                      name="confirmPassword"
                      placeholder="Подтверждение пароля"
                      autoComplete="new-password"
                      className={`${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''} border block w-full px-4 py-3 mb leading-tight text-gray-700 bg-gray-200 rounded appearance-none focus:outline-none focus:bg-white`}
                    />
                  </div>
                  <div className="flex items-center w-full my-3">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 font-bold text-white rounded bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                    >
                      Зарегистрироваться
                    </button>
                  </div>
                  <Link
                    to="/login"
                    className="inline-block w-full text-lg text-center text-gray-500 align-baseline hover:text-blue-800"
                  >
                    Вернуться ко входу
                  </Link>
                  {showToast && (
                    <Toast
                      type={toastType}
                      message={toastMessage}
                      dismissError
                    />
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default Register;
