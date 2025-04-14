package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.LearningPlan;
import com.example.edupulse_backend.service.LearningPlanService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/api/v1/plans")
@RequiredArgsConstructor
public class LearningPlanController {

    @Autowired
    private final LearningPlanService service;

    @GetMapping("/sample")
    public String sample() {
        return "Hello world";
    }

    //create a learning plan
    @PostMapping("/create")
    public ResponseEntity<?> createPlan(@RequestBody LearningPlan plan){
        try{
            LearningPlan saved = service.create(plan);
            return ResponseEntity.status(201).body(toModel(saved));
        }catch(Exception e){
            return ResponseEntity.status(500).body("Error creating a plan: " + e.getMessage());
        }

    }

    //Get All Learning plans
    @GetMapping
    public ResponseEntity<?> getAllPlans(){
        try{
            List<EntityModel<LearningPlan>> plans = service.getAll().stream()
                    .map(this::toModel)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(plans);//200
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving plans: "+e.getMessage());
        }
    }

    //Get a single learning plan
    @GetMapping("/{id}")
    public ResponseEntity<?> getPlan(@PathVariable String id){
        try{
            Optional<LearningPlan> plan  = service.getById(id);
            return plan.map(p -> ResponseEntity.ok(toModel(p)))
                    .orElse(ResponseEntity.notFound().build());
        }catch (Exception e){
            return ResponseEntity.status(500).body("Error retrieving a plan: "+e.getMessage());
        }
    }

    //Update Task status
    @PutMapping("/{id}/tasks/{index}")
    public ResponseEntity<?> updateTaskStatus(
            @PathVariable String id,
            @PathVariable int index,
            @RequestParam boolean completed
    ){
        try{
            Optional<LearningPlan> updated = service.updateTaskStatus(id, index, completed);
            return updated.map(p -> ResponseEntity.ok(toModel(p))) //200
                    .orElse(ResponseEntity.notFound().build());
        }catch(Exception e) {
            return ResponseEntity.status(500).body("Error updating task status: " + e.getMessage());
        }
    }

    //Update learning plans
    @PatchMapping("/update/{planId}")
    public ResponseEntity<?> updateLearningPlan(
            @PathVariable String planId,
            @RequestBody LearningPlan planUpdates
    ){
            try{
                Optional<LearningPlan> updatePlan = service.updatePlan(planId, planUpdates);
                return updatePlan.map(p -> ResponseEntity.status(201).body(toModel(p)))
                        .orElse(ResponseEntity.notFound().build());
            }
            catch(Exception e){
                return ResponseEntity.status(500).body("Error updating a plan: "+e.getMessage());
            }
    }

    //delete a learning plan
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable String id){
        try{
            Optional<LearningPlan> plan = service.getById(id);
            if(plan.isPresent()){
                service.delete(id);
                return ResponseEntity.noContent().build();//204
            }else{
                return ResponseEntity.notFound().build();//404
            }
        }catch(Exception e){
            return ResponseEntity.status(500).body("Error deleting plan: "+e.getMessage());
        }
    }

    // HATEOAS model builder
    private EntityModel<LearningPlan> toModel(LearningPlan plan) {
        return EntityModel.of(plan,
                linkTo(methodOn(LearningPlanController.class).getPlan(plan.getId())).withSelfRel(),
                linkTo(methodOn(LearningPlanController.class).getAllPlans()).withRel("all-plans"),
                linkTo(methodOn(LearningPlanController.class).updateTaskStatus(plan.getId(), 0, true)).withRel("mark-task-complete"),
                linkTo(methodOn(LearningPlanController.class).updateLearningPlan(plan.getId(),null)).withRel("update-plan"),
                linkTo(methodOn(LearningPlanController.class).createPlan(null)).withRel("create"),
                linkTo(methodOn(LearningPlanController.class).deletePlan(plan.getId())).withRel("delete")

        );
    }


}
