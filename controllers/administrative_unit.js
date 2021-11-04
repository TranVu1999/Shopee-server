// Models
const Province = require("./../models/province");
const District = require("./../models/district");
const Ward = require("./../models/ward");


module.exports = {
    /**
     * Get list province
    */
    getListProvince: async function(req, res){   

        try {
            
            const listProvince_db = await Province.find();

            return res
            .json({
                success: true,
                message: "Bạn có thể lấy dữ liệu này",
                listProvince: listProvince_db
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
     * Get list district
    */
     getListDistrict: async function(req, res){   
        const {provinceCode} = req.params;

        try {
            
            const listDistrict_db = await District.find({provinceCode});

            return res
            .json({
                success: true,
                message: "Bạn có thể lấy dữ liệu này",
                listDistrict: listDistrict_db
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
     * Get list ward
    */
     getListWard: async function(req, res){   
        const {districtCode} = req.params;

        try {
            
            const listWard_db = await Ward.find({districtCode});

            return res
            .json({
                success: true,
                message: "Bạn có thể lấy dữ liệu này",
                listWard: listWard_db
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
