const express=require("express"),
router=express.Router(),
bodyparser=require("body-parser"),
ControladorAula=require("../../../controlador/c_aula")


router.use(bodyparser.json())

router.post("/registrar",ControladorAula.registrar)


module.exports= router