import { 
  BeakerIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

export function QualityCertificates({ qualityTests, batch }) {
  if (!qualityTests || qualityTests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <BeakerIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">
          No Quality Tests Available
        </h3>
        <p className="text-gray-600">
          Quality test results for this product are not available.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Laboratory Certificates & Quality Tests
        </h2>
        <p className="text-gray-600">
          All quality tests performed on this product batch, including detailed results 
          and certifications from accredited laboratories.
        </p>
      </div>

      {/* Quality Tests */}
      {qualityTests.map((test, index) => (
        <div key={test.id || index} className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Test Header */}
          <div className={`p-6 border-l-4 ${test.overallPassed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {test.overallPassed ? (
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quality Test #{index + 1}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lab ID: {test.labId} | Test ID: {test.id}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`badge ${test.overallPassed ? 'badge-success' : 'badge-error'}`}>
                  {test.overallPassed ? 'PASSED' : 'FAILED'}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(test.testDate || test.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Test Details */}
          <div className="p-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Moisture Content */}
              {test.testResults?.moisture && (
                <TestResultCard
                  title="Moisture Content"
                  icon={BeakerIcon}
                  result={test.testResults.moisture}
                  unit="%"
                />
              )}

              {/* Pesticide Residues */}
              {test.testResults?.pesticideResidues && (
                <TestResultCard
                  title="Pesticide Residues"
                  icon={DocumentTextIcon}
                  result={test.testResults.pesticideResidues}
                  unit=""
                />
              )}

              {/* Heavy Metals */}
              {test.testResults?.heavyMetals && (
                <TestResultCard
                  title="Heavy Metals"
                  icon={BeakerIcon}
                  result={test.testResults.heavyMetals}
                  unit="ppm"
                />
              )}

              {/* Microbiology */}
              {test.testResults?.microbiology && (
                <TestResultCard
                  title="Microbiology"
                  icon={BeakerIcon}
                  result={test.testResults.microbiology}
                  unit="CFU/g"
                />
              )}

              {/* DNA Barcode */}
              {test.testResults?.dnaBarcode && (
                <TestResultCard
                  title="DNA Barcoding"
                  icon={DocumentTextIcon}
                  result={test.testResults.dnaBarcode}
                  unit=""
                />
              )}
            </div>

            {/* Certification Level */}
            {test.certificationLevel && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Certification Level: {test.certificationLevel}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quality Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {qualityTests.length}
            </div>
            <div className="text-sm text-gray-500">Total Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {qualityTests.filter(t => t.overallPassed).length}
            </div>
            <div className="text-sm text-gray-500">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {qualityTests.filter(t => !t.overallPassed).length}
            </div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TestResultCard({ title, icon: Icon, result, unit }) {
  const renderResult = () => {
    if (typeof result === 'object') {
      if (result.value !== undefined) {
        return (
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {result.value}{unit}
            </div>
            <div className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              {result.passed ? 'Within limits' : 'Exceeds limits'}
            </div>
            {result.threshold && (
              <div className="text-xs text-gray-500">
                Threshold: {result.threshold}{unit}
              </div>
            )}
          </div>
        )
      } else if (result.passed !== undefined) {
        return (
          <div>
            <div className={`text-lg font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              {result.passed ? 'PASSED' : 'FAILED'}
            </div>
            {result.detected && Array.isArray(result.detected) && (
              <div className="text-sm text-gray-600">
                {result.detected.length === 0 ? 'None detected' : `${result.detected.length} detected`}
              </div>
            )}
          </div>
        )
      }
    }
    
    return (
      <div className="text-lg font-semibold text-gray-900">
        {String(result)}
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon className="h-5 w-5 text-gray-400" />
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      </div>
      {renderResult()}
    </div>
  )
}