// Models
const Account = require("./../models/account");
const Address = require("./../models/address")


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
    }
}
