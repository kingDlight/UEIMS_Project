const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'FPT', 'SWP391', 'ueims', 'UEIMS_Project', 'ueims_frontend', 'src', 'pages', 'student', 'tabs', 'ApplicationsTab.tsx');

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
  "export const ApplicationsTab: React.FC = () => {",
  "export const ApplicationsTab: React.FC = () => {\n  const { t } = useTranslation(['applications']);"
);

// handleWithdraw messages
content = content.replace("'Application withdrawn successfully!'", "t('applicationWithdrawn', 'Application withdrawn successfully!')");
content = content.replace("'Failed to withdraw application!'", "t('failedWithdraw', 'Failed to withdraw application!')");

// statusLabel
content = content.replace("'Screening Passed'", "t('statusScreeningPassed', 'Screening Passed')");
content = content.replace("'Interview Scheduled'", "t('statusInterviewScheduled', 'Interview Scheduled')");
content = content.replace("'Screening Rejected'", "t('statusScreeningRejected', 'Screening Rejected')");
content = content.replace("status || 'Unknown'", "status || t('statusUnknown', 'Unknown')");

// UI texts
content = content.replace(">My Applications<", ">{t('myApplicationsTitle', 'My Applications')}<");
content = content.replace(">Track all your job applications in one place<", ">{t('myApplicationsDesc', 'Track all your job applications in one place')}<");

content = content.replace("label: 'All'", "label: t('all', 'All')");
content = content.replace("label: 'Pending'", "label: t('pending', 'Pending')");
content = content.replace("label: 'Screening'", "label: t('screening', 'Screening')");
content = content.replace("label: 'Interview'", "label: t('interview', 'Interview')");
content = content.replace("label: 'Accepted'", "label: t('accepted', 'Accepted')");
content = content.replace("label: 'Rejected'", "label: t('rejected', 'Rejected')");

content = content.replace('title="No applications yet"', 'title={t("noApplicationsYet", "No applications yet")}');
content = content.replace('description="Start applying to internships to see your applications here"', 'description={t("startApplying", "Start applying to internships to see your applications here")}');

content = content.replace("'Internship Position'", "t('internshipPosition', 'Internship Position')");
content = content.replace(">Withdraw<", ">{t('withdraw', 'Withdraw')}<");
content = content.replace("'Collapse' : 'Expand'", "t('collapse', 'Collapse') : t('expand', 'Expand')");

content = content.replace(">Position<", ">{t('position', 'Position')}<");
content = content.replace(">Enterprise<", ">{t('enterprise', 'Enterprise')}<");
content = content.replace(">Cover Letter<", ">{t('coverLetter', 'Cover Letter')}<");
content = content.replace(">Applied At<", ">{t('appliedAt', 'Applied At')}<");

content = content.replace("`${range[0]}-${range[1]} of ${total}`", "`${range[0]}-${range[1]} ${t('ofTotal', 'of {{total}}', { total })}`");

fs.writeFileSync(filePath, content, 'utf-8');
console.log('ApplicationsTab updated for i18n');
