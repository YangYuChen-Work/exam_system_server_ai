package org.practicedemo.exam.service.impl;


import org.practicedemo.exam.entity.Paper;
import org.practicedemo.exam.mapper.PaperMapper;
import org.practicedemo.exam.service.PaperService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


/**
 * 试卷服务实现类
 */
@Slf4j
@Service
public class PaperServiceImpl extends ServiceImpl<PaperMapper, Paper> implements PaperService {


} 