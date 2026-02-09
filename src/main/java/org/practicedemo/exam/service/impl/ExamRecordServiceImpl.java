package org.practicedemo.exam.service.impl;

import org.practicedemo.exam.common.Result;
import org.practicedemo.exam.entity.ExamRecord;
import org.practicedemo.exam.mapper.ExamRecordMapper;
import org.practicedemo.exam.service.ExamRecordService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 考试记录Service实现类
 * 实现考试记录相关的业务逻辑
 */
@Service
public class ExamRecordServiceImpl extends ServiceImpl<ExamRecordMapper, ExamRecord> implements ExamRecordService {
    

} 