package org.practicedemo.exam.service.impl;

import org.practicedemo.exam.service.FileUploadService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

/**
 * projectName: com.atguigu.exam.service.impl
 *
 * @author: 赵伟风
 * description:
 */
@Service
@Slf4j
public class FileUploadServiceImpl implements FileUploadService {

    // @Autowired
    // private MinioClient minioClient;
    // @Autowired
    // private MinioProperties minioProperties;

    @Override
    public String uploadFile(String folder, MultipartFile file) throws Exception {
        // 临时实现：不依赖MinIO，返回模拟的文件URL
        // 1. 生成唯一文件名
        String objectName = folder + "/" + new SimpleDateFormat("yyyyMMdd").format(new Date()) + "/" +
                UUID.randomUUID().toString().replaceAll("-","")+"_"+ file.getOriginalFilename();

        log.debug("文件上传核心业务方法，处理后的文件对象名：{}",objectName);

        // 2. 返回模拟的文件URL
        String url = "http://localhost:8080/files/" + objectName;
        log.info("文件上传核心业务，完成{}文件上传，返回模拟地址为：{}",objectName,url);
        return url;
    }
}