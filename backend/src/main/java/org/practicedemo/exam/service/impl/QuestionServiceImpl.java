package org.practicedemo.exam.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.practicedemo.exam.entity.Question;
import org.practicedemo.exam.mapper.QuestionMapper;
import org.practicedemo.exam.service.QuestionService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.practicedemo.exam.vo.QuestionImportVo;
import org.practicedemo.exam.vo.QuestionPageVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * 题目Service实现类
 * 实现题目相关的业务逻辑
 */
@Slf4j
@Service
public class QuestionServiceImpl extends ServiceImpl<QuestionMapper, Question> implements QuestionService {

    @Autowired
    private QuestionMapper questionMapper;


    @Override
    public void customPageService(Page<Question> pageList, QuestionPageVo questionPageVo) {
        questionMapper.customPage(pageList, questionPageVo);
    }
}