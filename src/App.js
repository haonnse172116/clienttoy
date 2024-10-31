import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import CreateToy from './pages/createToy/CreateToy';
import ToysList from './pages/toyList/ToyList';
import Layout from './components/layout/Layout';
import ToyManagement from './pages/toyManagement/ToyManagement';
import MyRequests from './pages/myRequest/MyRequest';
import AllRequests from './pages/allRequests/AllRequests';
import Cart from './pages/cart/Cart';
import Checkout from './pages/checkout/Checkout';
import Transactions from './pages/transaction/Transactions';
import OrderManagement from './pages/orderManagement/OrderManagement';


function App() {
  return (
    <div>
        <Layout>
    <Routes>
    <Route path="/toy-management" element={<ToyManagement />}/>
      <Route path='/' element={<ToysList/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/signup' element={<SignUp/>}/>
      <Route path='/createToy' element={<CreateToy/>}/>
      <Route path="/my-requests" element={<MyRequests />}/>
      <Route path="/all-requests" element={<AllRequests />} />
      <Route path='/cart' element={<Cart/>}/>
      <Route path='/checkout' element={<Checkout/>}/>
      <Route path='/transaction' element={<Transactions/>}/>
      <Route path='/order-management' element={<OrderManagement/>}/>
    </Routes>
    </Layout>
    </div>
  );
}

export default App;
