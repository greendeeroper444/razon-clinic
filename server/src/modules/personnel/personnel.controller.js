const PersonnelService = require("./personnel.service");

class PersonnelController {

    async addPersonnel(req, res, next) {
        try {
            const { 
                firstName,
                lastName,
                middleName,
                contactNumber,
                password,
                birthdate,
                sex,
                address,
                role
            } = req.body;

            const personnelData = {
                firstName,
                lastName,
                middleName,
                contactNumber,
                password,
                birthdate,
                sex,
                address,
                role
            };

            //validate data
            await PersonnelService.validatePersonnelData(personnelData);

            //create personnel
            const personnel = await PersonnelService.createPersonnel(personnelData);

            return res.status(201).json({
                success: true,
                message: 'Personnel created successfully',
                data: personnel
            });
        } catch (error) {
            next(error);
        }
    }

    async getPersonnel(req, res, next) {
        try {
            const result = await PersonnelService.getPersonnel(req.query);

            return res.status(200).json({
                success: true,
                message: 'Personnel retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getPersonnelById(req, res, next) {
        try {
            const { personnelId } = req.params;
            const personnel = await PersonnelService.getPersonnelById(personnelId);

            return res.status(200).json({
                success: true,
                message: 'Personnel retrieved successfully',
                data: personnel
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePersonnel(req, res, next) {
        try {
            const { personnelId } = req.params;
            const updateData = req.body;

            const personnel = await PersonnelService.updatePersonnel(personnelId, updateData);

            return res.status(200).json({
                success: true,
                message: 'Personnel updated successfully',
                data: personnel
            });
        } catch (error) {
            next(error);
        }
    }

    async deletePersonnel(req, res, next) {
        try {
            const { personnelId } = req.params;
            const personnel = await PersonnelService.deletePersonnel(personnelId);

            return res.status(200).json({
                success: true,
                message: 'Personnel deleted successfully',
                data: personnel
            });
        } catch (error) {
            next(error);
        }
    }

    async getPersonnelByRole(req, res, next) {
        try {
            const { role } = req.query;
            const personnel = await PersonnelService.getPersonnelByRole(role);

            return res.status(200).json({
                success: true,
                message: `${role} personnel retrieved successfully`,
                data: personnel
            });
        } catch (error) {
            next(error);
        }
    }

    async getPersonnelStats(req, res, next) {
        try {
            const stats = await PersonnelService.getPersonnelStats();

            return res.status(200).json({
                success: true,
                message: 'Personnel statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PersonnelController();