package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.LearningPlan;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.LearningPlanService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/plans")
@RequiredArgsConstructor
public class LearningPlanController {

    @Autowired
    private final LearningPlanService service;

    //create a learning plan
    @PostMapping("/create")
    public ResponseEntity<ResponseDto> createPlan(@RequestBody LearningPlan plan) {

        ResponseDto response = service.createLearningPlan(plan);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    //Get All Learning plans
    @GetMapping
    public ResponseEntity<ResponseDto> getPlans() {
        ResponseDto response = service.getAllLearningPlans();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //Get learning plans on creator id
    @GetMapping("/user/{userid}")
    public ResponseEntity<ResponseDto> getLearningPlanOfUser(
            @PathVariable String userid
    ) {
        ResponseDto response = service.getLearningPlanOfUser(userid);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    //Get a single learning plan
    @GetMapping("/{planId}")
    public ResponseEntity<ResponseDto> getPlan(
            @PathVariable String planId
    ) {
        LearningPlan plan = service.getLearningPlan(planId);

        EntityModel<LearningPlan> model = EntityModel.of(plan,
                linkTo(methodOn(LearningPlanController.class).getPlan(plan.getId())).withSelfRel(),
                linkTo(methodOn(LearningPlanController.class).getPlans()).withRel("all-plans"),
                linkTo(methodOn(LearningPlanController.class).getLearningPlanOfUser(plan.getCreatorId())).withRel("user-plans"),
                linkTo(methodOn(LearningPlanController.class).updateLearningPlan(plan.getId(), null)).withRel("update-plan"),
                linkTo(methodOn(LearningPlanController.class).createPlan(null)).withRel("create"),
                linkTo(methodOn(LearningPlanController.class).deletePlan(plan.getId())).withRel("delete"),
                linkTo(methodOn(LearningPlanController.class).updateTaskStatus(plan.getId(), 0, true)).withRel("mark-task-complete")
        );

        return new ResponseEntity<>(new ResponseDto(false,model), HttpStatus.OK);
    }

    //Update learning plans
    @PatchMapping("/update/{planId}")
    public ResponseEntity<ResponseDto> updateLearningPlan(
            @PathVariable String planId,
            @RequestBody LearningPlan planUpdates
    ){
            ResponseDto response = service.updateLearningPLan(planId, planUpdates);
            return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //delete a learning plan
    @DeleteMapping("/delete/{planId}")
    public ResponseEntity<ResponseDto> deletePlan(
            @PathVariable String planId
    ){
        ResponseDto response = service.deleteLearningPlan(planId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    //update task status
    @PutMapping("/{planId}/tasks/{index}")
    public ResponseEntity<ResponseDto> updateTaskStatus(
            @PathVariable String planId,
            @PathVariable int index,
            @RequestParam boolean isCompleted
    ){
        ResponseDto response = service.updateTaskStatus(planId, index, isCompleted);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

//    // HATEOAS model builder
//    private EntityModel<LearningPlan> toModel(LearningPlan plan) {
//        return EntityModel.of(plan,
//                linkTo(methodOn(LearningPlanController.class).getPlan(plan.getId())).withSelfRel(),
//                linkTo(methodOn(LearningPlanController.class).getPlans()).withRel("all-plans"),
//                linkTo(methodOn(LearningPlanController.class).getLearningPlanOfUser(plan.getCreatorId())).withRel("user-plans"),
//                linkTo(methodOn(LearningPlanController.class).updateTaskStatus(plan.getId(), 0, true)).withRel("mark-task-complete"),
//                linkTo(methodOn(LearningPlanController.class).updateLearningPlan(plan.getId(),null)).withRel("update-plan"),
//                linkTo(methodOn(LearningPlanController.class).createPlan(null)).withRel("create"),
//                linkTo(methodOn(LearningPlanController.class).deletePlan(plan.getId())).withRel("delete")
//
//        );
//    }


}
