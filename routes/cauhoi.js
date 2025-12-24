const express = require('express');

const router = express.Router();

const cauhoi = require('../controllers/cauhoi');
const checkRole = require('../middlewares/checkRole');
const middlewareController = require('../middlewares/verifyToken');


router.get('/fetch/:id', middlewareController.verifyToken, checkRole('xem câu hỏi'), cauhoi.getCauhois)

router.post('/add', middlewareController.verifyToken,checkRole('thêm câu hỏi'), cauhoi.addCauhoi)
router.delete('/delete/:id',middlewareController.verifyToken,checkRole('xóa câu hỏi'),  cauhoi.deleteCauhoi)
router.put('/edit/:id',middlewareController.verifyToken,checkRole('sửa câu hỏi'),  cauhoi.updatedCauhoi)

module.exports = router