const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    addAddress,
    getMyAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require('../controllers/addressController');

router.post('/add', protect, addAddress);
router.get('/my-addresses', protect, getMyAddresses);
router.put('/:addressId', protect, updateAddress);
router.delete('/:addressId', protect, deleteAddress);
router.put('/:addressId/default', protect, setDefaultAddress);

module.exports = router;