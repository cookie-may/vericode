// @ts-nocheck
/* Mock code generator for duplicate functions display */

export interface MockCodeExample {
  id: string;
  language: string;
  code: string;
  title: string;
}

function generatePythonExamples(functionName: string): MockCodeExample[] {
  return [
    {
      id: 'py-1',
      language: 'python',
      title: 'Standard Implementation',
      code: `def ${functionName}(data):
    """Process and validate data"""
    if not data:
        return None
    result = []
    for item in data:
        if validate(item):
            result.append(transform(item))
    return result`,
    },
    {
      id: 'py-2',
      language: 'python',
      title: 'List Comprehension',
      code: `def ${functionName}(data):
    """Concise version using comprehension"""
    return [
        transform(item)
        for item in data
        if validate(item)
    ]`,
    },
    {
      id: 'py-3',
      language: 'python',
      title: 'With Error Handling',
      code: `def ${functionName}(data):
    """Implementation with exception handling"""
    try:
        validated = [item for item in data if validate(item)]
        return [transform(item) for item in validated]
    except (ValueError, TypeError) as e:
        logger.error(f"Error processing data: {e}")
        return []`,
    },
    {
      id: 'py-4',
      language: 'python',
      title: 'Async Version',
      code: `async def ${functionName}(data):
    """Asynchronous version for I/O operations"""
    results = []
    for item in data:
        if await validate_async(item):
            result = await transform_async(item)
            results.append(result)
    return results`,
    },
  ];
}

function generateTypeScriptExamples(functionName: string): MockCodeExample[] {
  return [
    {
      id: 'ts-1',
      language: 'typescript',
      title: 'Standard Implementation',
      code: `function ${functionName}(data: unknown[]): unknown[] {
  if (!data?.length) return [];
  const result: unknown[] = [];
  for (const item of data) {
    if (validate(item)) {
      result.push(transform(item));
    }
  }
  return result;
}`,
    },
    {
      id: 'ts-2',
      language: 'typescript',
      title: 'Type-Safe Generic',
      code: `function ${functionName}<T, R>(
  data: T[],
  validator: (item: T) => boolean,
  transformer: (item: T) => R
): R[] {
  return data
    .filter(validator)
    .map(transformer);
}`,
    },
    {
      id: 'ts-3',
      language: 'typescript',
      title: 'Functional Approach',
      code: `const ${functionName} = (data: unknown[]) =>
  data
    .filter((item) => validate(item))
    .map((item) => transform(item));`,
    },
    {
      id: 'ts-4',
      language: 'typescript',
      title: 'Class Method',
      code: `class DataProcessor {
  ${functionName}(data: unknown[]): unknown[] {
    return data
      .filter((item) => this.validate(item))
      .map((item) => this.transform(item));
  }

  private validate(item: unknown): boolean {
    // validation logic
    return true;
  }
}`,
    },
    {
      id: 'ts-5',
      language: 'typescript',
      title: 'Promise-Based',
      code: `async function ${functionName}(data: unknown[]): Promise<unknown[]> {
  const validated = data.filter((item) => validate(item));
  return Promise.all(
    validated.map((item) => transformAsync(item))
  );
}`,
    },
  ];
}

function generateJavaScriptExamples(functionName: string): MockCodeExample[] {
  return [
    {
      id: 'js-1',
      language: 'javascript',
      title: 'Standard Implementation',
      code: `function ${functionName}(data) {
  if (!Array.isArray(data)) return [];
  return data
    .filter(item => validate(item))
    .map(item => transform(item));
}`,
    },
    {
      id: 'js-2',
      language: 'javascript',
      title: 'Arrow Function',
      code: `const ${functionName} = (data) =>
  Array.isArray(data)
    ? data.filter(validate).map(transform)
    : [];`,
    },
    {
      id: 'js-3',
      language: 'javascript',
      title: 'With Reduce',
      code: `function ${functionName}(data) {
  return data.reduce((acc, item) => {
    if (validate(item)) {
      acc.push(transform(item));
    }
    return acc;
  }, []);
}`,
    },
  ];
}

function generateReactExamples(functionName: string): MockCodeExample[] {
  return [
    {
      id: 'react-1',
      language: 'typescript',
      title: 'React Hook',
      code: `function ${functionName}(initialData: unknown[]) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const processed = data
      .filter((item) => validate(item))
      .map((item) => transform(item));
    setData(processed);
  }, []);

  return data;
}`,
    },
    {
      id: 'react-2',
      language: 'typescript',
      title: 'Custom Hook',
      code: `function use${functionName}(data: unknown[]) {
  return useMemo(
    () => data
      .filter((item) => validate(item))
      .map((item) => transform(item)),
    [data]
  );
}`,
    },
    {
      id: 'react-3',
      language: 'typescript',
      title: 'Component Method',
      code: `export function DataComponent({ items }: Props) {
  const processed = items
    .filter(item => validate(item))
    .map(item => transform(item));

  return (
    <div>
      {processed.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}`,
    },
  ];
}

export function generateMockCodeExamples(
  functionName: string,
  filePath: string
): MockCodeExample[] {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';

  switch (ext) {
    case 'py':
      return generatePythonExamples(functionName);
    case 'ts':
    case 'tsx':
      if (filePath.includes('component') || filePath.includes('react')) {
        return generateReactExamples(functionName);
      }
      return generateTypeScriptExamples(functionName);
    case 'js':
    case 'jsx':
      return generateJavaScriptExamples(functionName);
    case 'java':
      return [
        {
          id: 'java-1',
          language: 'java',
          title: 'Standard Method',
          code: `public List<Object> ${functionName}(List<Object> data) {
    return data.stream()
        .filter(item -> validate(item))
        .map(item -> transform(item))
        .collect(Collectors.toList());
}`,
        },
      ];
    case 'go':
      return [
        {
          id: 'go-1',
          language: 'go',
          title: 'Standard Implementation',
          code: `func ${functionName}(data []interface{}) []interface{} {
    var result []interface{}
    for _, item := range data {
        if validate(item) {
            result = append(result, transform(item))
        }
    }
    return result
}`,
        },
      ];
    case 'rs':
      return [
        {
          id: 'rs-1',
          language: 'rust',
          title: 'Iterator Pattern',
          code: `fn ${functionName}(data: Vec<impl Trait>) -> Vec<impl Trait> {
    data.into_iter()
        .filter(|item| validate(item))
        .map(|item| transform(item))
        .collect()
}`,
        },
      ];
    default:
      return generateTypeScriptExamples(functionName);
  }
}
