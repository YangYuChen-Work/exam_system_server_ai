package org.practicedemo.exam.service.impl;

import org.practicedemo.exam.entity.Question;
import org.practicedemo.exam.mapper.QuestionMapper;
import org.practicedemo.exam.service.QuestionService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 题目Service实现类
 * 实现题目相关的业务逻辑
 */
@Slf4j
@Service
public class QuestionServiceImpl extends ServiceImpl<QuestionMapper, Question> implements QuestionService {
    

} 