const express = require('express');

const router = express.Router();

const monthi = require('../controllers/monthi.cjs');
const thisinh = require('../controllers/thisinh.cjs');
const checkRole = require('../middlewares/checkRole.cjs');
const middlewareController = require('../middlewares/verifyToken.cjs');


router.get('/fetch', middlewareController.verifyToken, checkRole('xem môn thi'), monthi.getMonthiList)
router.get('/fetch-monthiOfUser', middlewareController.verifyToken, checkRole('xem môn thi'), monthi.getMonthiOfUser)

router.get('/detail/fetch/:id', middlewareController.verifyToken, checkRole('xem môn thi'), monthi.getMonthiDetail)
router.post('/add', middlewareController.verifyToken,checkRole('thêm môn thi'), monthi.addMonthi)
router.delete('/delete/:id',middlewareController.verifyToken,checkRole('xóa môn thi'),  monthi.deleteMonthi)
router.put('/edit/:id',middlewareController.verifyToken,checkRole('sửa môn thi'),  monthi.editMonthi)


router.get('/:id/cuoc-thi-list/fetch', middlewareController.verifyToken, checkRole('xem cuộc thi'), monthi.getCuocthis)
router.post('/:id/cuoc-thi/add', middlewareController.verifyToken,checkRole('thêm cuộc thi'), monthi.addCuocthi)
router.put('/:id/cuoc-thi/:id1/edit-status', middlewareController.verifyToken,checkRole('sửa trạng thái cuộc thi'), monthi.updateStatusCuocthi)
router.put('/:id/cuoc-thi/:id1/update-option', middlewareController.verifyToken,checkRole('sửa cuộc thi'), monthi.updateOptionCuocthi)
router.delete('/:id/cuoc-thi/:id1/delete',middlewareController.verifyToken,checkRole('xóa cuộc thi'),  monthi.deleteCuocthi)

router.get('/ket-qua/cuoc-thi/:id', middlewareController.verifyToken, checkRole('xem cuộc thi'), monthi.getKetquathi)

// thí sinh dự thi 
router.get('/:id/cuoc-thi/thi-sinh/fetch', middlewareController.verifyToken, checkRole('xem thí sinh'), thisinh.getThisinhs)
router.post('/:id/cuoc-thi/thi-sinh/add', middlewareController.verifyToken,checkRole('thêm thí sinh'), thisinh.addThisinh)
router.put('/:id/cuoc-thi/thi-sinh/:id1/edit', middlewareController.verifyToken,checkRole('thêm thí sinh'), thisinh.updatedThisinh)
router.delete('/:id/cuoc-thi/thi-sinh/:id1/delete',middlewareController.verifyToken,checkRole('xóa thí sinh'),  thisinh.deleteThisinh)
module.exports = router