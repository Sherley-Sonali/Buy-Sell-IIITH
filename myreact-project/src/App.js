import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Profile from './Profile';
import SignUp from './SignUp';
import UploadItem from './UploadItem';
import SearchItems from './SearchItems';
import ItemDetails from './ItemDetails';
import Cart from './Cart';
import DeliverItems from './DeliverItems';
import OrdersHistory from './OrdersHistory';
import Chat from './Chat';
function App() {
    return (
        <div>
            <Routes>
                <Route path="/profile" element={<Profile />} />
                <Route path="/upload" element={<UploadItem />} />
                <Route path="/search" element={<SearchItems />} />
                <Route path="/search/item/:id" element={<ItemDetails />} />
<Route path="/cart/item/:id" element={<ItemDetails />} />
                <Route path="/items/:id" element={<ItemDetails />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/" element={<Login />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/deliver" element={<DeliverItems />} />
                <Route path='/history' element={<OrdersHistory />} />
                <Route path='/chat' element={<Chat />} />
            </Routes>
            </div>
    );
}

export default App;
