package org.practicedemo.exam.mapper;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.practicedemo.exam.entity.QuestionAnswer;

@Mapper
public interface QuestionAnswerMapper extends BaseMapper<QuestionAnswer> {
} 