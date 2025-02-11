// // not using
// const API_BASE_URL = 'http://localhost:5000/api';

// export const signup = async (userData) => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/signup`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(userData),
//         });

//         const data = await response.json();
        
//         if (!response.ok) {
//             throw new Error(data.error || 'Signup failed');
//         }

//         return data;
//     } catch (error) {
//         throw error;
//     }
// };

// export const login = async (credentials) => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(credentials),
//         });

//         const data = await response.json();
        
//         if (!response.ok) {
//             throw new Error(data.error || 'Login failed');
//         }

//         return data;
//     } catch (error) {
//         throw error;
//     }
// };