package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.LearningPlan;
import com.example.edupulse_backend.repository.LearningPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LearningPlanService {

    @Autowired
    private final LearningPlanRepository learningPlanRepository;

    //create a new plan
    public LearningPlan create(LearningPlan plan){
        return learningPlanRepository.save(plan);
    }

    //get all learning plans
    public List<LearningPlan> getAll(){
        return learningPlanRepository.findAll();
    }

    //get a single plan
    public Optional<LearningPlan> getById(String id){
        return learningPlanRepository.findById(id);
    }

    //update task status
    public Optional<LearningPlan> updateTaskStatus(String planId, int taskIndex, boolean isCompleted){
        Optional<LearningPlan> optional = learningPlanRepository.findById(planId);
        if(optional.isPresent()){
            LearningPlan plan = optional.get();
            plan.getTasks().get(taskIndex).setCompleted(isCompleted);
            return Optional.of(learningPlanRepository.save(plan));
        }
        return Optional.empty();
    }

    //update a learning plan
    public Optional<LearningPlan> updatePlan(String planId, LearningPlan plan){
        Optional<LearningPlan> optional = learningPlanRepository.findById(planId);
        if(optional.isPresent()){

            LearningPlan original = optional.get();

            if(plan.getTitle() != null){
                original.setTitle(plan.getTitle());
            }
            if(plan.getDescription() != null){
                original.setDescription(plan.getDescription());
            }
            if(plan.getTasks() != null){
                original.setTasks(plan.getTasks());
            }

            return Optional.of(learningPlanRepository.save(original));
        }
        return Optional.empty();
    }

    //delete a plan
    public void delete(String planId){
        learningPlanRepository.deleteById(planId);

    }
}
