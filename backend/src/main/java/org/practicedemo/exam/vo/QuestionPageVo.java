package org.practicedemo.exam.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "接收分页四个核心参数的Vo对象")
public class QuestionPageVo {
    private Long id;
    private String difficulty;
    private String type;
    private String keywords;
}
