import { createServer, Model, Response } from 'miragejs';
import hotelsData from './data/hotels.json';
import countriesData from './data/countries.json';

export function makeServer({ environment = 'development' } = {}) {
  let server = createServer({
    environment,

    models: {
      user: Model,
      // Define other models here if needed
    },

    seeds(server) {
      server.create('user', {
        id: '1',
        email: 'user1@example.com',
        password: 'password1',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        phone: '1234567890',
        country: 'USA',
        isPhoneVerified: true,
        isEmailVerified: true,
      });
      server.create('user', {
        id: '2',
        email: 'user2@example.com',
        password: 'password2',
        firstName: 'Jane',
        lastName: 'Doe',
        fullName: 'Jane Doe',
        phone: '0987654321',
        country: 'UK',
        isPhoneVerified: false,
        isEmailVerified: true,
      });
    },

    routes() {
      this.namespace = 'api';

      // Add a logged-in user state to the server
      let loggedInUser = null;

      this.passthrough('http://localhost:4000/*');

      this.get('/users/auth-user', () => {
        if (loggedInUser) {
          return new Response(
            200,
            {},
            {
              errors: [],
              data: {
                isAuthenticated: true,
                userDetails: {
                  id: loggedInUser.id,
                  firstName: loggedInUser.firstName,
                  lastName: loggedInUser.lastName,
                  fullName: loggedInUser.fullName,
                  email: loggedInUser.email,
                  phone: loggedInUser.phone,
                  country: loggedInUser.country,
                  isPhoneVerified: loggedInUser.isPhoneVerified,
                  isEmailVerified: loggedInUser.isEmailVerified,
                },
              },
            }
          );
        } else {
          return new Response(
            200,
            {},
            {
              errors: [],
              data: {
                isAuthenticated: false,
                userDetails: {},
              },
            }
          );
        }
      });

      this.post('/users/login', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const user = schema.users.findBy({ email: attrs.email });

        if (user && user.password === attrs.password) {
          loggedInUser = user;
          return new Response(
            200,
            {},
            {
              data: {
                token:
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBKb2huIiwiaWQiOjEsImlhdCI6MTcwNzU0NTQ5MSwiZXhwIjoxNzA3NTQ5MDkxfQ.dxweIMZGiCuiViov1EfLtu3UwanUMp7TjL85hMDW4rc',
              },
              errors: [],
            }
          );
        } else {
          return new Response(
            404,
            {},
            {
              errors: ['User not found or invalid credentials'],
              data: {},
            }
          );
        }
      });

      this.post('/users/logout', (_schema, _request) => {
        loggedInUser = null;
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              status: 'User logged out successfully',
            },
          }
        );
      });

      this.put('/users/register', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const existingUser = schema.users.findBy({ email: attrs.email });

        if (existingUser) {
          return new Response(
            409,
            {},
            { errors: ['User already exists with that email'] }
          );
        } else {
          // Create a new user
          const newUser = schema.users.create({
            firstName: attrs.firstName,
            lastName: attrs.lastName,
            email: attrs.email,
            phone: attrs.phone,
            password: attrs.password,
          });
          return new Response(
            200,
            {},
            {
              errors: [],
              user: newUser.attrs,
            }
          );
        }
      });

      this.patch('/users/update-profile', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const user = schema.users.findBy({ email: loggedInUser.email });

        if (user) {
          user.update(attrs);
          return new Response(
            200,
            {},
            {
              errors: [],
              data: {
                status: 'Profile updated successfully',
              },
            }
          );
        } else {
          return new Response(
            404,
            {},
            {
              errors: ['User not found'],
              data: {},
            }
          );
        }
      });

      this.get('/users/bookings', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: [
                {
                  bookingId: 'BKG123',
                  bookingDate: '2024-01-10',
                  hotelName: 'Seaside Resort',
                  checkInDate: '2024-01-20',
                  checkOutDate: '2024-01-25',
                  totalFare: '14,500 р.',
                },
                {
                  bookingId: 'BKG124',
                  bookingDate: '2024-01-03',
                  hotelName: 'Mountain Retreat',
                  checkInDate: '2024-02-15',
                  checkOutDate: '2024-02-20',
                  totalFare: '5,890 р.',
                },
                {
                  bookingId: 'BKG125',
                  bookingDate: '2024-01-11',
                  hotelName: 'City Central Hotel',
                  checkInDate: '2024-03-01',
                  checkOutDate: '2024-03-05',
                  totalFare: '21,700 р.',
                },
              ],
            },
          }
        );
      });

      this.get('/users/payment-methods', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: [
                {
                  id: '1',
                  cardType: 'Visa',
                  cardNumber: '**** **** **** 1234',
                  expiryDate: '08/26',
                },
                {
                  id: '2',
                  cardType: 'MasterCard',
                  cardNumber: '**** **** **** 5678',
                  expiryDate: '07/24',
                },
                {
                  id: '3',
                  cardType: 'American Express',
                  cardNumber: '**** **** **** 9012',
                  expiryDate: '05/25',
                },
              ],
            },
          }
        );
      });

      this.get('/hotel/:hotelId/booking/enquiry', (_schema, request) => {
        let hotelId = request.params.hotelId;
        const result = hotelsData.find((hotel) => {
          return Number(hotel.hotelCode) === Number(hotelId);
        });
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              name: result.title,
              cancellationPolicy: 'Бесплатная отмена за день до заселения',
              checkInTime: '12:00 PM',
              checkOutTime: '10:00 AM',
              currentNightRate: result.price,
              maxGuestsAllowed: 5,
              maxRoomsAllowedPerGuest: 3,
            },
          }
        );
      });

      this.get('/popularDestinations', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: [
                {
                  code: 1211,
                  name: 'Мумбаи',
                  imageUrl: '/images/cities/mumbai.jpg',
                },
                {
                  code: 1212,
                  name: 'Бангкок',
                  imageUrl: '/images/cities/bangkok.jpg',
                },
                {
                  code: 1213,
                  name: 'Лондон',
                  imageUrl: '/images/cities/london.jpg',
                },
                {
                  code: 1214,
                  name: 'Дубай',
                  imageUrl: '/images/cities/dubai.jpg',
                },
                {
                  code: 1215,
                  name: 'Осло',
                  imageUrl: '/images/cities/oslo.jpg',
                },
              ],
            },
          }
        );
      });

      this.get('/nearbyHotels', () => {
        const hotels = hotelsData.filter((hotel) => {
          return hotel.city === 'пуна';
        });
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: hotels,
            },
          }
        );
      });

      this.get('/hotel/:hotelId', (_schema, request) => {
        let hotelId = request.params.hotelId;
        const description = [
          'Вас ждет безмятежный отдых в нашем роскошном отеле, предлагающем сочетание роскоши и комфорта с первоклассными удобствами.',
          'Насладитесь вершиной элегантности в наших прекрасно оформленных номерах с потрясающим видом на городской пейзаж.',
          'Побалуйте себя гастрономическими изысками в ресторанах отеля, где подают блюда местной и интернациональной кухни.',
          'Отдохните в нашем ультрасовременном спа-салоне и оздоровительном центре, который является идеальным местом для расслабления чувств.',
          'Расположенный в самом центре города, наш отель является идеальной отправной точкой как для туристов, так и для деловых путешественников.',
        ];

        const result = hotelsData.find((hotel) => {
          return Number(hotel.hotelCode) === Number(hotelId);
        });

        result.description = description;

        return new Response(
          200,
          {},
          {
            errors: [],
            data: result,
          }
        );
      });

      this.get('/hotel/:hotelId/reviews', (_schema, request) => {
        // hardcoded hotelId for now so to not add mock for each hotel
        const currentPage = request.queryParams.currentPage;
        let hotelId = 71222;
        const result = hotelsData.find((hotel) => {
          return Number(hotel.hotelCode) === Number(hotelId);
        });
        const totalRatings = result.reviews.data.reduce(
          (acc, review) => acc + review.rating,
          0
        );
        const initialCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        const starCounts = result.reviews.data.reduce((acc, review) => {
          const ratingKey = Math.floor(review.rating).toString();
          if (acc.hasOwnProperty(ratingKey)) {
            acc[ratingKey]++;
          }
          return acc;
        }, initialCounts);

        const metadata = {
          totalReviews: result.reviews.data.length,
          averageRating: (totalRatings / result.reviews.data.length).toFixed(1),
          starCounts,
        };

        //paging
        const pageSize = 5;
        const paging = {
          currentPage: currentPage || 1,
          totalPages:
            Math.floor((result.reviews.data.length - 1) / pageSize) + 1,
          pageSize,
        };

        // paginated data
        const data = result.reviews.data.slice(
          (paging.currentPage - 1) * pageSize,
          paging.currentPage * pageSize
        );

        return {
          errors: [],
          data: {
            elements: data,
          },
          metadata,
          paging,
        };
      });

      this.put('/hotel/add-review', (schema, request) => {
        // const attrs = JSON.parse(request.requestBody);
        // const hotelId = attrs.hotelId;
        // const review = attrs.review;
        // const rating = attrs.rating;
        // const user = schema.users.findBy({ email: attrs.email });
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              status: 'Review added successfully',
            },
          }
        );
      });

      this.get('/hotels', (_schema, request) => {
        let currentPage = request.queryParams.currentPage;
        const filters = request.queryParams.filters;
        const parsedFilters = JSON.parse(filters);
        const parsedAdvancedFilters = JSON.parse(
          request.queryParams.advancedFilters
        );
        const city = parsedFilters.city;
        const star_ratings = parsedFilters.star_ratings;
        const priceFilter = parsedFilters.priceFilter;
        const sortByFilter = parsedAdvancedFilters.find((filter) => {
          return filter.sortBy;
        });

        const filteredResults = hotelsData.filter((hotel) => {
          const hotelRating = parseFloat(hotel.ratings);
          const hotelPrice = parseFloat(hotel.price.replace(',', ''));
          const isCityMatch = city === '' || hotel.city === city;
          const isPriceMatch =
            !priceFilter ||
            (hotelPrice >= parseFloat(priceFilter.start) &&
              hotelPrice <= parseFloat(priceFilter.end));

          if (isCityMatch && isPriceMatch) {
            if (star_ratings && star_ratings.length > 0) {
              return star_ratings.some((selectedRating) => {
                const selected = parseFloat(selectedRating);
                const range = 0.5;
                return Math.abs(hotelRating - selected) <= range;
              });
            } else {
              // If no star ratings are provided, return all hotels for the city (or all cities if city is empty)
              return true;
            }
          }
          return false;
        });

        if (sortByFilter) {
          const sortType = sortByFilter.sortBy;
          if (sortType === 'priceLowToHigh') {
            filteredResults.sort((a, b) => {
              return a.price - b.price;
            });
          }
          if (sortType === 'priceHighToLow') {
            filteredResults.sort((a, b) => {
              return b.price - a.price;
            });
          }
        }

        // pagination config
        const pageSize = 6;
        const totalPages =
          Math.floor((filteredResults.length - 1) / pageSize) + 1;
        currentPage = currentPage > totalPages ? totalPages : currentPage;
        const paging = {
          currentPage: currentPage || 1,
          totalPages: Math.floor((filteredResults.length - 1) / pageSize) + 1,
          pageSize,
        };

        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: filteredResults.slice(
                (paging.currentPage - 1) * pageSize,
                paging.currentPage * pageSize
              ),
            },
            metadata: {
              totalResults: filteredResults.length,
            },
            paging,
          }
        );
      });

      this.get('/availableCities', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: ['pune', 'bangalore', 'mumbai'],
            },
          }
        );
      });

      this.get('/hotels/verticalFilters', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: [
                {
                  filterId: 'star_ratings',
                  title: 'Рейтинг',
                  filters: [
                    {
                      id: '5_star_rating',
                      title: '5 Звёзд',
                      value: '5',
                    },
                    {
                      id: '4_star_rating',
                      title: '4 Звёзды',
                      value: '4',
                    },
                    {
                      id: '3_star_rating',
                      title: '3 Звёзды',
                      value: '3',
                    },
                  ],
                },
                {
                  filterId: 'propety_type',
                  title: 'Тип',
                  filters: [
                    {
                      id: 'prop_type_hotel',
                      title: 'Отель',
                    },
                    {
                      id: 'prop_type_apartment',
                      title: 'Апартаменты',
                    },
                    {
                      id: 'prop_type_villa',
                      title: 'Вилла',
                    },
                  ],
                },
              ],
            },
          }
        );
      });

      this.post('/payments/confirmation', () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(
              new Response(
                200,
                {},
                {
                  errors: [],
                  data: {
                    status: 'Payment successful',
                    bookingDetails: [
                      {
                        label: 'Номер бронирования',
                        value: 'BKG123',
                      },
                      {
                        label: 'Дата бронирования',
                        value: '2024-01-10',
                      },
                      {
                        label: 'Отель',
                        value: 'Seaside Resort',
                      },
                      {
                        label: 'Дата заезда',
                        value: '2024-01-20',
                      },
                      {
                        label: 'Дата выезда',
                        value: '2024-01-25',
                      },
                      {
                        label: 'Обащя сумма',
                        value: '14,500 р.',
                      },
                    ],
                  },
                }
              )
            );
          }, 6000); // 2000 milliseconds = 2 seconds
        });
      });

      this.get('/misc/countries', () => {
        return new Response(
          200,
          {},
          {
            errors: [],
            data: {
              elements: countriesData,
            },
          }
        );
      });
    },
  });

  return server;
}
