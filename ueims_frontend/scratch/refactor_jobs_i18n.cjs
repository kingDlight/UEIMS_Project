const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'FPT', 'SWP391', 'ueims', 'UEIMS_Project', 'ueims_frontend', 'src', 'pages', 'student', 'tabs', 'JobBoardTab.tsx');

let content = fs.readFileSync(filePath, 'utf-8');

// Add import
if (!content.includes("import { useTranslation }")) {
  content = content.replace(
    "import React, { useEffect, useState, useMemo } from 'react';",
    "import React, { useEffect, useState, useMemo } from 'react';\nimport { useTranslation } from 'react-i18next';"
  );
}

// Add hook
content = content.replace(
  "export const JobBoardTab: React.FC = () => {",
  "export const JobBoardTab: React.FC = () => {\n  const { t } = useTranslation(['jobs']);"
);

// handleApply messages
content = content.replace("'Application failed. This job posting has reached its deadline.'", "t('applicationFailedDeadline', 'Application failed. This job posting has reached its deadline.')");
content = content.replace("'Application submitted successfully!'", "t('applicationSuccess', 'Application submitted successfully!')");
content = content.replace("'You have already applied for this position.'", "t('alreadyApplied', 'You have already applied for this position.')");
content = content.replace("'Please upload your CV in Profile before applying.'", "t('pleaseUploadCv', 'Please upload your CV in Profile before applying.')");
content = content.replace("'This job posting has reached its deadline.'", "t('jobDeadlineReached', 'This job posting has reached its deadline.')");
content = content.replace("'Application failed!'", "t('applicationFailed', 'Application failed!')");

// UI texts
content = content.replace(">Job Board<", ">{t('jobBoardTitle', 'Job Board')}<");
content = content.replace(">Browse and apply for internship positions<", ">{t('jobBoardDesc', 'Browse and apply for internship positions')}<");
content = content.replace('placeholder="Search by position, company..."', 'placeholder={t("searchPlaceholder", "Search by position, company...")}');
content = content.replace(">Search<", ">{t('search', 'Search')}<");
content = content.replace(">Filter by:<", ">{t('filterBy', 'Filter by:')}<");
content = content.replace(">Confirm Application<", ">{t('confirmApplication', 'Confirm Application')}<");
content = content.replace(">You are applying for:<", ">{t('applyingFor', 'You are applying for:')}<");
content = content.replace("Are you sure? You can only submit your application ONCE. No modifications allowed after submission.", "{t('areYouSure', 'Are you sure? You can only submit your application ONCE. No modifications allowed after submission.')}");
content = content.replace(">Cancel<", ">{t('cancel', 'Cancel')}<");
content = content.replace(">Confirm & Submit<", ">{t('confirmAndSubmit', 'Confirm & Submit')}<");

content = content.replace('title="No matching job postings found"', 'title={t("noJobsFound", "No matching job postings found")}');
content = content.replace('description="Please try refining your keywords or filters"', 'description={t("refineFilters", "Please try refining your keywords or filters")}');

content = content.replace("'Internship Position'", "t('internshipPosition', 'Internship Position')");
content = content.replace("'Company'", "t('company', 'Company')");
content = content.replace(" positions<", " {t('positions', 'positions')}<");
content = content.replace("'Job description...'", "t('jobDescription', 'Job description...')");

content = content.replace(">Open<", ">{t('open', 'Open')}<");
content = content.replace(">Closed<", ">{t('closed', 'Closed')}<");
content = content.replace(">View details<", ">{t('viewDetails', 'View details')}<");
content = content.replace("`${range[0]}-${range[1]} of ${total} jobs`", "`${range[0]}-${range[1]} ${t('ofTotalJobs', 'of {{total}} jobs', { total })}`");
content = content.replace(">Close<", ">{t('close', 'Close')}<");
content = content.replace(">Description<", ">{t('description', 'Description')}<");
content = content.replace(">Requirements<", ">{t('requirements', 'Requirements')}<");
content = content.replace(">Application Deadline<", ">{t('applicationDeadline', 'Application Deadline')}<");

content = content.replace(">Please upload your CV in Profile before applying.<", ">{t('pleaseUploadCv', 'Please upload your CV in Profile before applying.')}<");
content = content.replace("hasCv ? 'Apply Now' : 'CV Required'", "hasCv ? t('applyNow', 'Apply Now') : t('cvRequired', 'CV Required')");
content = content.replace("'Applications Closed'", "t('applicationsClosed', 'Applications Closed')");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('JobBoardTab updated for i18n');
