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
    public ResponseDto createPlan(@RequestBody LearningPlan plan) {
        return service.createLearningPlan(plan);
    }

    //Get All Learning plans
    @GetMapping
    public ResponseDto getPlans() {
        return service.getAllLearningPlans();
    }

    //Get learning plans on creator id
    @GetMapping("{userid}/plans")
    public ResponseDto getLearningPlanOfUser(
            @PathVariable String userid
    ) {
        return service.getLearningPlanOfUser(userid);
    }


    //Get a single learning plan
    @GetMapping("/{planId}")
    public ResponseDto getPlan(
            @PathVariable String planId
    ) {
        return service.getLearningPlan(planId);
    }

    //Update learning plans
    @PatchMapping("/update/{planId}")
    public ResponseDto updateLearningPlan(
            @PathVariable String planId,
            @RequestBody LearningPlan planUpdates
    ){
            return service.updateLearningPLan(planId, planUpdates);
    }

    //delete a learning plan
    @DeleteMapping("/delete/{planId}")
    public ResponseDto deletePlan(
            @PathVariable String planId
    ){
        return service.deleteLearningPlan(planId);
    }

    //update task status
    @PutMapping("/{planId}/tasks/{index}")
    public ResponseDto updateTaskStatus(
            @PathVariable String planId,
            @PathVariable int index,
            @RequestParam boolean isCompleted
    ){
        return service.updateTaskStatus(planId, index, isCompleted);
    }


//    // HATEOAS model builder
//    private EntityModel<LearningPlan> toModel(LearningPlan plan) {
//        return EntityModel.of(plan,
//                linkTo(methodOn(LearningPlanController.class).getPlan(plan.getId())).withSelfRel(),
//                linkTo(methodOn(LearningPlanController.class).getAllPlans()).withRel("all-plans"),
//                linkTo(methodOn(LearningPlanController.class).updateTaskStatus(plan.getId(), 0, true)).withRel("mark-task-complete"),
//                linkTo(methodOn(LearningPlanController.class).updateLearningPlan(plan.getId(),null)).withRel("update-plan"),
//                linkTo(methodOn(LearningPlanController.class).createPlan(null)).withRel("create"),
//                linkTo(methodOn(LearningPlanController.class).deletePlan(plan.getId())).withRel("delete")
//
//        );
//    }


}
