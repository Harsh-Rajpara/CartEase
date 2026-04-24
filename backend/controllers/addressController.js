const User = require('../models/User');

// @desc    Add new address to user
// @route   POST /api/address/add
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const addressData = {
            fullAddress: `${req.body.flatHouseNo}, ${req.body.areaStreet}${req.body.landmark ? `, ${req.body.landmark}` : ''}, ${req.body.city}, ${req.body.state} - ${req.body.pincode}, ${req.body.country || 'India'}`,
            flatHouseNo: req.body.flatHouseNo,
            areaStreet: req.body.areaStreet,
            landmark: req.body.landmark || '',
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            country: req.body.country || 'India',
            isDefault: req.body.isDefault || false
        };

        // If this is the first address or isDefault is true
        if (user.addresses.length === 0) {
            addressData.isDefault = true;
        }

        // If setting as default, remove default from other addresses
        if (addressData.isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        user.addresses.push(addressData);
        await user.save();

        res.status(201).json({
            success: true,
            data: user.addresses,
            message: 'Address added successfully'
        });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user's all addresses
// @route   GET /api/address/my-addresses
// @access  Private
exports.getMyAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            count: user.addresses.length,
            data: user.addresses
        });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update address
// @route   PUT /api/address/:addressId
// @access  Private
exports.updateAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const addressIndex = user.addresses.findIndex(
            addr => addr._id.toString() === req.params.addressId
        );

        if (addressIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Update address
        const updatedAddress = {
            fullAddress: `${req.body.flatHouseNo}, ${req.body.areaStreet}${req.body.landmark ? `, ${req.body.landmark}` : ''}, ${req.body.city}, ${req.body.state} - ${req.body.pincode}, ${req.body.country || 'India'}`,
            flatHouseNo: req.body.flatHouseNo,
            areaStreet: req.body.areaStreet,
            landmark: req.body.landmark || '',
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode,
            country: req.body.country || 'India',
            isDefault: req.body.isDefault || false
        };

        // If setting as default, remove default from other addresses
        if (updatedAddress.isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        user.addresses[addressIndex] = { ...user.addresses[addressIndex]._doc, ...updatedAddress };
        await user.save();

        res.json({
            success: true,
            data: user.addresses,
            message: 'Address updated successfully'
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete address
// @route   DELETE /api/address/:addressId
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const deletedAddress = user.addresses.id(req.params.addressId);
        
        if (!deletedAddress) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        const wasDefault = deletedAddress.isDefault;
        
        // Remove address
        user.addresses.pull(req.params.addressId);
        
        // If deleted address was default and there are other addresses, set first as default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }
        
        await user.save();

        res.json({
            success: true,
            data: user.addresses,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Set default address
// @route   PUT /api/address/:addressId/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove default from all addresses
        user.addresses.forEach(addr => {
            addr.isDefault = false;
        });

        // Set new default
        const address = user.addresses.id(req.params.addressId);
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        address.isDefault = true;
        await user.save();

        res.json({
            success: true,
            data: user.addresses,
            message: 'Default address updated'
        });
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};