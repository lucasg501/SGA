-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: aluguel
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `aluguel`
--

DROP TABLE IF EXISTS `aluguel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aluguel` (
  `idAluguel` int NOT NULL AUTO_INCREMENT,
  `valorAluguel` decimal(10,2) NOT NULL,
  `quitada` enum('S','N') DEFAULT NULL,
  `idContrato` int DEFAULT NULL,
  `idLocador` int DEFAULT NULL,
  `idLocatario` int DEFAULT NULL,
  `dataVencimento` date DEFAULT NULL,
  PRIMARY KEY (`idAluguel`),
  KEY `idContrato` (`idContrato`),
  CONSTRAINT `aluguel_ibfk_1` FOREIGN KEY (`idContrato`) REFERENCES `contrato` (`idContrato`)
) ENGINE=InnoDB AUTO_INCREMENT=186 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aluguel`
--

LOCK TABLES `aluguel` WRITE;
/*!40000 ALTER TABLE `aluguel` DISABLE KEYS */;
INSERT INTO `aluguel` VALUES (175,1.50,'N',14,3,2,'2025-06-05'),(176,1.50,'S',14,3,2,'2025-07-05'),(177,1.50,'N',14,3,2,'2025-08-05'),(178,1.50,'N',14,3,2,'2025-09-05'),(179,1.50,'N',14,3,2,'2025-10-05'),(180,1397.00,'S',16,1,4,'2025-08-10'),(181,1397.00,'N',16,1,4,'2025-09-10'),(182,1397.00,'N',16,1,4,'2025-10-10'),(183,1397.00,'N',16,1,4,'2025-11-10'),(184,1397.00,'N',16,1,4,'2025-12-10'),(185,1397.00,'N',16,1,4,'2026-01-10');
/*!40000 ALTER TABLE `aluguel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contrato`
--

DROP TABLE IF EXISTS `contrato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrato` (
  `idContrato` int NOT NULL AUTO_INCREMENT,
  `idImovel` int DEFAULT NULL,
  `idLocatario` int DEFAULT NULL,
  `idLocador` int DEFAULT NULL,
  `qtdParcelas` int NOT NULL,
  `valorParcela` decimal(10,2) NOT NULL,
  `dataVencimento` date DEFAULT NULL,
  `inicioVigenciaContrato` date DEFAULT NULL,
  `fimVigenciaContrato` date DEFAULT NULL,
  PRIMARY KEY (`idContrato`),
  KEY `idImovel` (`idImovel`),
  KEY `idLocatario` (`idLocatario`),
  KEY `idLocador` (`idLocador`),
  CONSTRAINT `contrato_ibfk_1` FOREIGN KEY (`idImovel`) REFERENCES `imovel` (`idImovel`),
  CONSTRAINT `contrato_ibfk_2` FOREIGN KEY (`idLocatario`) REFERENCES `locatario` (`idLocatario`),
  CONSTRAINT `contrato_ibfk_3` FOREIGN KEY (`idLocador`) REFERENCES `locador` (`idLocador`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contrato`
--

LOCK TABLES `contrato` WRITE;
/*!40000 ALTER TABLE `contrato` DISABLE KEYS */;
INSERT INTO `contrato` VALUES (14,3,4,3,5,1.50,'2026-06-05','2026-05-05','2010-10-10'),(15,2,3,2,5,0.25,'2025-08-10','2025-08-10','2025-09-10'),(16,1,4,1,6,1397.00,'2025-08-10','2025-08-05','2026-02-05');
/*!40000 ALTER TABLE `contrato` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imovel`
--

DROP TABLE IF EXISTS `imovel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `imovel` (
  `idImovel` int NOT NULL AUTO_INCREMENT,
  `refImovel` varchar(50) NOT NULL,
  `valorAluguel` decimal(10,2) NOT NULL,
  `idLocatario` int DEFAULT NULL,
  `idLocador` int DEFAULT NULL,
  PRIMARY KEY (`idImovel`),
  KEY `idLocatario` (`idLocatario`),
  KEY `idLocador` (`idLocador`),
  CONSTRAINT `imovel_ibfk_1` FOREIGN KEY (`idLocatario`) REFERENCES `locatario` (`idLocatario`),
  CONSTRAINT `imovel_ibfk_2` FOREIGN KEY (`idLocador`) REFERENCES `locador` (`idLocador`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imovel`
--

LOCK TABLES `imovel` WRITE;
/*!40000 ALTER TABLE `imovel` DISABLE KEYS */;
INSERT INTO `imovel` VALUES (1,'AP10',1.00,NULL,1),(2,'AP25',1.00,NULL,2),(3,'CA556',4.69,3,3);
/*!40000 ALTER TABLE `imovel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locador`
--

DROP TABLE IF EXISTS `locador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locador` (
  `idLocador` int NOT NULL AUTO_INCREMENT,
  `nomeLocador` varchar(245) NOT NULL,
  `cpfLocador` varchar(15) NOT NULL,
  PRIMARY KEY (`idLocador`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locador`
--

LOCK TABLES `locador` WRITE;
/*!40000 ALTER TABLE `locador` DISABLE KEYS */;
INSERT INTO `locador` VALUES (1,'Alfredo','45503566699'),(2,'Godofredo','45503566699'),(3,'tralalero tralala','78932145688');
/*!40000 ALTER TABLE `locador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locatario`
--

DROP TABLE IF EXISTS `locatario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locatario` (
  `idLocatario` int NOT NULL AUTO_INCREMENT,
  `nomeLocatario` varchar(245) NOT NULL,
  `cpfLocatario` varchar(15) NOT NULL,
  PRIMARY KEY (`idLocatario`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locatario`
--

LOCK TABLES `locatario` WRITE;
/*!40000 ALTER TABLE `locatario` DISABLE KEYS */;
INSERT INTO `locatario` VALUES (1,'Ronaldinho Gaucho','12345678911'),(2,'Balerina capuccina','55589635877'),(3,'tum tum tum sahur','78932145688'),(4,'Lucas Gabriel Teixeira Gois','46307233826');
/*!40000 ALTER TABLE `locatario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagamentoavulso`
--

DROP TABLE IF EXISTS `pagamentoavulso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentoavulso` (
  `idPagamento` int NOT NULL AUTO_INCREMENT,
  `valorPagamento` decimal(10,2) NOT NULL,
  `dataPagamento` date NOT NULL,
  `pago` enum('s','n') DEFAULT NULL,
  `idContrato` int DEFAULT NULL,
  PRIMARY KEY (`idPagamento`),
  KEY `idContrato` (`idContrato`),
  CONSTRAINT `pagamentoavulso_ibfk_1` FOREIGN KEY (`idContrato`) REFERENCES `contrato` (`idContrato`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagamentoavulso`
--

LOCK TABLES `pagamentoavulso` WRITE;
/*!40000 ALTER TABLE `pagamentoavulso` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagamentoavulso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipospix`
--

DROP TABLE IF EXISTS `tipospix`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipospix` (
  `idTipoPix` int NOT NULL AUTO_INCREMENT,
  `nomeTipo` varchar(20) NOT NULL,
  PRIMARY KEY (`idTipoPix`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipospix`
--

LOCK TABLES `tipospix` WRITE;
/*!40000 ALTER TABLE `tipospix` DISABLE KEYS */;
INSERT INTO `tipospix` VALUES (1,'Telefone'),(2,'E-mail'),(3,'CPF'),(4,'CNPJ');
/*!40000 ALTER TABLE `tipospix` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `idUsuario` int NOT NULL AUTO_INCREMENT,
  `login` varchar(20) NOT NULL,
  `senha` varchar(20) NOT NULL,
  `chavePix` varchar(100) DEFAULT NULL,
  `nomePix` varchar(100) DEFAULT NULL,
  `cidade` varchar(25) NOT NULL,
  `tipoPix` int DEFAULT NULL,
  PRIMARY KEY (`idUsuario`),
  KEY `fk_tipoPix` (`tipoPix`),
  CONSTRAINT `fk_tipoPix` FOREIGN KEY (`tipoPix`) REFERENCES `tipospix` (`idTipoPix`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'lucas','123','+5518996570042','lucas gabriel teixeira go','presidente prudente',1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-14 23:08:45
