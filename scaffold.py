import os

base = r'E:\SU26\UEIMS_Project\UEIMS_Project\ueims_backend'
dirs = [
    'src/main/java/com/ueims/config',
    'src/main/java/com/ueims/controller',
    'src/main/java/com/ueims/dto/request',
    'src/main/java/com/ueims/dto/response',
    'src/main/java/com/ueims/exception',
    'src/main/java/com/ueims/model/entity',
    'src/main/java/com/ueims/model/enums',
    'src/main/java/com/ueims/repository',
    'src/main/java/com/ueims/security',
    'src/main/java/com/ueims/service',
    'src/main/resources',
    'src/test/java/com/ueims'
]

for d in dirs:
    os.makedirs(os.path.join(base, d), exist_ok=True)

pom_content = """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>
    <groupId>com.ueims</groupId>
    <artifactId>ueims_backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>ueims_backend</name>
    <description>UEIMS Backend Application</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
"""

with open(os.path.join(base, 'pom.xml'), 'w', encoding='utf-8') as f:
    f.write(pom_content)

app_props = """spring.application.name=ueims_backend
spring.datasource.url=jdbc:postgresql://localhost:5432/ueims_db
spring.datasource.username=postgres
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
server.port=8080
"""

with open(os.path.join(base, 'src/main/resources/application.properties'), 'w', encoding='utf-8') as f:
    f.write(app_props)

app_java = """package com.ueims;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UeimsBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(UeimsBackendApplication.class, args);
    }
}
"""
with open(os.path.join(base, 'src/main/java/com/ueims/UeimsBackendApplication.java'), 'w', encoding='utf-8') as f:
    f.write(app_java)

print('Backend scaffolded successfully.')
