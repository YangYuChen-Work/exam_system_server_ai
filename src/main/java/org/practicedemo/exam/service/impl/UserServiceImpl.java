package org.practicedemo.exam.service.impl;

import org.practicedemo.exam.entity.User;
import org.practicedemo.exam.mapper.UserMapper;
import org.practicedemo.exam.service.UserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import org.springframework.stereotype.Service;

/**
 * 用户Service实现类
 * 实现用户相关的业务逻辑
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

} 