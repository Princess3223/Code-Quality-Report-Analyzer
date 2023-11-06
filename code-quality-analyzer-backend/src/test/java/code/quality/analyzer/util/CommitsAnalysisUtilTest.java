/**
 *
 */
package code.quality.analyzer.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.eclipse.jgit.api.errors.InvalidRefNameException;
import org.eclipse.jgit.api.errors.RefNotFoundException;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import code.quality.analyzer.exception.InvalidCommitsException;
import code.quality.analyzer.service.CommitsAnalysisService;
import code.quality.analyzer.service.CommitsAnalysisServiceImpl;

/**
 * Test CommitsAnalysisUtil class methods
 */
class CommitsAnalysisUtilTest {

	private static List<String> commitIds = null;
	private static String repoPath;
	private static CommitsAnalysisService commitsAnalysisService;

	@BeforeAll
	static void setUp() {
		commitIds = new ArrayList<String>();
		commitIds.add(Constants.TEST_COMMIT_ID_3);
		commitsAnalysisService = new CommitsAnalysisServiceImpl();
		repoPath = commitsAnalysisService.cloneRepository(Constants.TEST_REPO_URL_3);
	}

	@Test
	void testGetCommitIdsForOneCommit() throws Exception {
		List<String> ids = CommitsAnalysisUtil.getCommitIds(repoPath, Constants.TEST_BRANCH, Constants.OneCommit);
		assertEquals(false, ids.isEmpty());
		assertEquals(Constants.OneCommit, ids.size());
		assertEquals(commitIds.get(0), ids.get(0));
	}
	
	@ParameterizedTest
	@CsvSource({"2,2", "1,1", "5,3", "0,0"})
	void testGetCommitIdsForTrend(int noOfCommits, int expectedSize) throws Exception {
		repoPath = commitsAnalysisService.cloneRepository(Constants.TEST_REPO_URL);
		List<String> ids = CommitsAnalysisUtil.getCommitIds(repoPath, Constants.TEST_BRANCH, noOfCommits);
		if(noOfCommits == 0) {
			assertEquals(true, ids.isEmpty());
		} else {
			assertEquals(false, ids.isEmpty());
		}
		assertEquals(expectedSize, ids.size());
	}

	@Test
	void testGetCommitIdsOneCommitException() throws Exception {
		assertThrows(RefNotFoundException.class, () -> CommitsAnalysisUtil.getCommitIds(repoPath, "abc", Constants.OneCommit));
		assertThrows(InvalidRefNameException.class, () -> CommitsAnalysisUtil.getCommitIds(repoPath, " ", Constants.OneCommit));
		assertThrows(InvalidRefNameException.class, () -> CommitsAnalysisUtil.getCommitIds(repoPath, null, Constants.OneCommit));
		assertThrows(UnsupportedOperationException.class, () -> CommitsAnalysisUtil.getCommitIds("", Constants.TEST_BRANCH, Constants.OneCommit));
		assertThrows(UnsupportedOperationException.class, () -> CommitsAnalysisUtil.getCommitIds(null, Constants.TEST_BRANCH, Constants.OneCommit));
	}

	@Test
	void testGenerateReportsForOneCommit() throws Exception {
		String path = CommitsAnalysisUtil.generateReports(commitIds, repoPath, Constants.TEST_BRANCH);
		assertEquals(repoPath + Constants.REPORT_PATH + "\\" + commitIds.get(0), path);
		assertEquals(true, Files.exists(Paths.get(path)));
	}
	
	@Test
	void testGenerateReportsForException() {
		assertThrows(InvalidCommitsException.class, () -> CommitsAnalysisUtil.generateReports(null, repoPath, Constants.TEST_BRANCH));
		assertThrows(InvalidCommitsException.class, () -> CommitsAnalysisUtil.generateReports(new ArrayList<String>(), repoPath, Constants.TEST_BRANCH));
	}
	
	@Test
	void testGenerateReportsForTrend() throws Exception {
		commitIds.add("d9a7bf910760638afa3cfeef09e2f980565b7aab");
		String path = CommitsAnalysisUtil.generateReports(commitIds, repoPath, Constants.TEST_BRANCH);
		assertEquals(repoPath + Constants.REPORT_PATH, path);
		assertEquals(true, Files.exists(Paths.get(path)));
	}
}
