// Models
const Account = require("./../models/account");
const Address = require("./../models/address");
const Province = require("./../models/province");
const District = require("./../models/district");
const Ward = require("./../models/ward");


module.exports = {

    /**
     * Create new address
    */
    add: async function(req, res){        
        const {accountId} = req;
        const {
            phoneNumber,
            fullname,
            houseNumber, 
            district,
            ward,
            province,
            isDeliveryAddress,
            isDefault,
            isReceivedAddress
        } = req.body;

        try {
            const account_db = await Account.findById(accountId);

            if(!account_db) {
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Thêm không thành công"
                }); 
            }

            const newAddress = new Address({
                phoneNumber,
                fullname,
                houseNumber, 
                district,
                ward,
                province,
                isDeliveryAddress,
                isDefault,
                isReceivedAddress,
                account: accountId
            });

            if(isDefault) {
                await Address.findOneAndUpdate({
                    account: accountId,
                    isDefault: true
                }, {isDefault: false});
            }

            await newAddress.save();

            return res
            .json({
                success: true,
                message: "Thêm địa chỉ thành công",
                address: newAddress
            });


        } catch (error) {
            console.log(error)
            return res
            .status(500)
            .json({
                success: false,
                message: "Internal server error"
            });
        }
    },

    /**
     * Edit address
    */
    edit: async function(req, res){        
        const {accountId} = req;
        const addressId = req.params.id;
        const {
            phoneNumber,
            fullname,
            houseNumber, 
            district,
            ward,
            province,
            isDeliveryAddress,
            isDefault,
            isReceivedAddress
        } = req.body;

        try {

            if(isDefault) {
                await Address.findOneAndUpdate({
                    account: accountId,
                    isDefault: true
                }, {isDefault: false});
            }
            
            const filter = {
                account: accountId,
                _id: addressId
            };

            const update = {
                phoneNumber,
                fullname,
                houseNumber, 
                district,
                ward,
                province,
                isDeliveryAddress,
                isDefault,
                isReceivedAddress,
                account: accountId
            }

            const updateAddress = await Address.findOneAndUpdate(
                filter, update, {new: true});

            if(updateAddress) {
                return res
                .json({
                    success: true,
                    message: "Chỉnh sửa địa chỉ thành công",
                    address: updateAddress
                });
            }

            return res
            .status(400)
            .json({
                success: false,
                message: "Chỉnh sửa địa chỉ không thành công"
            });


        } catch (error) {
            console.log(error)
            return res
            .status(500)
            .json({
                success: false,
                message: "Internal server error"
            });
        }
    },

    /**
     * Create new address
    */
    address: async function(req, res){        
        const {accountId} = req;
        const {
            province, district, ward
        } = req.body;

        try {
            let promises = []
            province.forEach(prov => {
                const newProvince = new Province({
                    name: prov.name,
                    code: prov.code
                });
                promises.push(newProvince.save());
            });
            
            
            district.forEach(async (dis) => {
                const newDistrict = new District({
                    name: dis.name,
                    code: dis.code,
                    provinceCode: dis.provinceCode
                });
                promises.push(newDistrict.save());
            })
            ward.forEach(async (war) => {
                const newWard = new Ward({
                    name: war.name,
                    code: war.code,
                    districtCode: war.districtCode
                });
                promises.push(newWard.save());
            });

            await Promise.all(promises);

            return res
            .json({
                success: true,
                message: "Thêm địa chỉ thành công"
            });


        } catch (error) {
            console.log(error)
            return res
            .status(500)
            .json({
                success: false,
                message: "Internal server error"
            });
        }
    },

    /**
     * Get list address
    */
    get: async function(req, res){        
        const {accountId} = req;

        try {

            const [account_db, listAddress_db] = await Promise.all([
                Account.findById(accountId),
                Address.find({account: accountId})
            ])

            if(!account_db) {
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Bạn không thể thực hiện thao tác này"
                }); 
            }

            return res
            .json({
                success: true,
                message: "Bạn có thể lấy dữ liệu này",
                listAddress: listAddress_db
            });


        } catch (error) {
            console.log(error)
            return res
            .status(500)
            .json({
                success: false,
                message: "Internal server error"
            });
        }
    },

    /**
    * Remove address
    */
    remove: async function(req, res){        
        const {accountId} = req;
        const addressId = req.params.id;        

        try {
            
            const addressRemove = await Address.findOneAndRemove({
                account: accountId,
                _id: addressId,
                isDefault: false
            })

            return res
            .json({
                success: true,
                message: "Đã xóa thành công",
                address: addressRemove
            });


        } catch (error) {
            console.log(error)
            return res
            .status(500)
            .json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}
