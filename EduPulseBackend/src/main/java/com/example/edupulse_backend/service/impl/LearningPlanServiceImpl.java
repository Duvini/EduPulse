package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.model.LearningPlan;
import com.example.edupulse_backend.model.Task;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.repository.LearningPlanRepository;
import com.example.edupulse_backend.service.LearningPlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningPlanServiceImpl implements LearningPlanService {

    private final LearningPlanRepository learningPlanRepository;

    @Override
    public ResponseDto createLearningPlan(LearningPlan learningPlan) {
        LearningPlan plan = learningPlanRepository.save(learningPlan);
        log.info("Learning plan created");
        return new ResponseDto(false, plan);
    }

    @Override
    public LearningPlan getLearningPlan(String planId) {
        return learningPlanRepository.findById(planId)
                .orElseThrow(()-> new RuntimeException("Learning plan not found"));
    }

    @Override
    public ResponseDto getAllLearningPlans() {
        List<LearningPlan> planList = learningPlanRepository.findAll();
        log.info("Retrieved all learning plans");
        return new ResponseDto(false, planList);
    }

    @Override
    public ResponseDto updateLearningPLan(String planId, LearningPlan plan) {
        Optional<LearningPlan> planOptional = learningPlanRepository.findById(planId);
        if (planOptional.isPresent()) {
            LearningPlan planToUpdate = planOptional.get();

            // Update plan-level fields
            if (plan.getTitle() != null) {
                planToUpdate.setTitle(plan.getTitle());
            }
            if (plan.getDescription() != null) {
                planToUpdate.setDescription(plan.getDescription());
            }

            // Update tasks individually
            if (plan.getTasks() != null && !plan.getTasks().isEmpty()) {
                List<Task> existingTasks = planToUpdate.getTasks();

                for (Task incomingTask : plan.getTasks()) {
                    Optional<Task> existingTaskOpt = existingTasks.stream()
                            .filter(t -> t.getName().equalsIgnoreCase(incomingTask.getName()))
                            .findFirst();

                    if (existingTaskOpt.isPresent()) {
                        Task existingTask = existingTaskOpt.get();
                        if (incomingTask.getDeadline() != null) {
                            existingTask.setDeadline(incomingTask.getDeadline());
                        }
                        if (incomingTask.getResources() != null) {
                            existingTask.setResources(incomingTask.getResources());
                        }
                        existingTask.setCompleted(incomingTask.isCompleted());
                    } else {
                        existingTasks.add(incomingTask); // Add new task if not found
                    }
                }

                planToUpdate.setTasks(existingTasks);
            }

            learningPlanRepository.save(planToUpdate);
            return new ResponseDto(false, planToUpdate);
        }

        return new ResponseDto(true, "Learning plan not found");
    }

    @Override
    public ResponseDto deleteLearningPlan(String planId) {
        learningPlanRepository.deleteById(planId);
        return new ResponseDto(false, "Learning plan deleted");
    }

    @Override
    public ResponseDto updateTaskStatus(String planId, int taskIndex, boolean isCompleted) {
        Optional<LearningPlan> plan = learningPlanRepository.findById(planId);
        if (plan.isPresent()) {
            LearningPlan taskToUpdate = plan.get();
            if (taskIndex >= 0 && taskIndex < taskToUpdate.getTasks().size()) {
                taskToUpdate.getTasks().get(taskIndex).setCompleted(isCompleted);
                learningPlanRepository.save(taskToUpdate);
                log.info("Task status updated");
                return new ResponseDto(false, taskToUpdate);
            }
            return new ResponseDto(true, "Invalid task index");
        }
        return new ResponseDto(true, "Learning plan not found");
    }

    @Override
    public ResponseDto getLearningPlanOfUser(String userId) {
        List<LearningPlan> plans = learningPlanRepository.findByCreatorId(userId);
        log.info("Retrieved all learning plans of user");
        return new ResponseDto(false, plans);
    }
}

