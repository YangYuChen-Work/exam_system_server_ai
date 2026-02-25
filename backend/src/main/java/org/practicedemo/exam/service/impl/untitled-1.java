// @Slf4j
// @Configuration
// @EnableConfigurationProperties(MinioProperties.class)
// public class MinioConfiguration {
// 
//     @Autowired
//     private MinioProperties minioProperties;
// 
//     @Bean
//     public MinioClient minioClient() {
//         MinioClient minioClient = MinioClient.builder()
//                 .endpoint(minioProperties.getEndpoint())
//                 .credentials(minioProperties.getUsername(), minioProperties.getPassword())
//                 .build();
//         log.info("完成了minio的连接和配置！minio客户端对象为：{}",minioClient);
//         return minioClient;
//     }
// }
